import os
import json
from typing import Optional, Dict, Any

try:
    import vertexai
    from vertexai.generative_models import GenerativeModel, GenerationConfig
    VERTEX_AI_AVAILABLE = True
    print("Vertex AI successfully imported")
except ImportError as e:
    print(f"Vertex AI not available: {e}")
    VERTEX_AI_AVAILABLE = False
    vertexai = None
    GenerativeModel = None
    GenerationConfig = None
except Exception as e:
    print(f"Unexpected error importing Vertex AI: {e}")
    VERTEX_AI_AVAILABLE = False
    vertexai = None
    GenerativeModel = None
    GenerationConfig = None


_PROJECT_ID = os.getenv("GCP_PROJECT_ID")

# Prefer a Vertex/Gemini-specific location if provided; fall back to GCP_LOCATION.
_RAW_LOCATION = (
    os.getenv("GEMINI_LOCATION")
    or os.getenv("VERTEX_LOCATION")
    or os.getenv("GCP_VERTEX_LOCATION")
    or os.getenv("GCP_LOCATION")
    or "us-central1"
)

_SUPPORTED = frozenset({
    "europe-west2", "asia-northeast2", "northamerica-northeast2", "asia-northeast1",
    "us-east4", "australia-southeast1", "africa-south1", "us-east7", "me-west1",
    "australia-southeast2", "us-south1", "us-west2", "southamerica-east1", "europe-west1",
    "southamerica-west1", "us-west3", "asia-northeast3", "asia-south1", "europe-west12",
    "us-west4", "asia-southeast2", "us-central1", "me-central2", "europe-west6",
    "us-west1", "europe-west9", "europe-west3", "us-east5", "europe-north1", "global",
    "europe-west8", "asia-east1", "us-east1", "asia-southeast1", "asia-east2",
    "asia-south2", "europe-central2", "europe-west4", "europe-southwest1", "me-central1",
    "northamerica-northeast1"
})

def _normalize_location(loc: str) -> str:
    loc = (loc or "").strip().lower()
    if loc in {"us"}:  # common shorthand used for Document AI
        return "us-central1"
    if loc in {"eu"}:
        return "europe-west4"
    return loc or "us-central1"

_LOCATION = _normalize_location(_RAW_LOCATION)
if _LOCATION not in _SUPPORTED:
    # Fallback to a safe default if an unsupported region was provided
    _LOCATION = "us-central1"

# Build ordered fallbacks for locations and models
_LOCATION_CANDIDATES = []
for cand in [_LOCATION, "us-central1", "us-east1"]:
    c = _normalize_location(cand)
    if c in _SUPPORTED and c not in _LOCATION_CANDIDATES:
        _LOCATION_CANDIDATES.append(c)

_MODEL_CANDIDATES = []
env_model = os.getenv("GEMINI_MODEL")
if env_model:
    _MODEL_CANDIDATES.append(env_model)
# Reasonable defaults in order
for m in [
    # Prefer 2.5 Flash Lite first if available
    "gemini-2.5-flash-lite-001",
    "gemini-2.5-flash-lite",
    "gemini-1.5-pro-002",
    "gemini-1.5-pro-001",
    "gemini-1.5-flash-002",
    "gemini-1.5-flash-001",
    "gemini-1.0-pro",
]:
    if m not in _MODEL_CANDIDATES:
        _MODEL_CANDIDATES.append(m)


def _ensure_vertex_init(location: str) -> None:
    # Safe to call multiple times; vertexai caches config
    if not _PROJECT_ID:
        raise RuntimeError("GCP_PROJECT_ID env var is required for Vertex AI")
    vertexai.init(project=_PROJECT_ID, location=location)


def _parse_gemini_response(response_text: str) -> Dict[str, Any]:
    """Parse the Gemini response and extract structured data"""
    try:
        # Clean the response text
        cleaned_text = response_text.strip()
        if cleaned_text.startswith('```json'):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.endswith('```'):
            cleaned_text = cleaned_text[:-3]
        
        # Parse JSON
        data = json.loads(cleaned_text)
        
        return {
            'document_type': data.get('documentType'),
            'complexity': data.get('complexity'),
            'risk_level': data.get('riskLevel'),
            'risk_factors': data.get('riskFactors', []),
            'key_parties': data.get('keyParties', []),
            'summary': data.get('summary'),
            'extracted_text': data.get('extractedText'),
            'word_count': data.get('wordCount'),
            'page_count': data.get('pageCount')
        }
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        # Fallback to original response
        return {
            'summary': response_text,
            'extracted_text': None
        }


def summarize_with_gemini(document_text: str, max_tokens: int = 800) -> str:
    """Summarize extracted document text using Gemini 1.5 Flash on Vertex AI.

    Args:
        document_text: Raw extracted text to summarize.
        max_tokens: Upper bound for summary length.

    Returns:
        A concise summary string.
    """
    if not document_text:
        return ""
    
    if not VERTEX_AI_AVAILABLE:
        print("Vertex AI not available, returning basic summary")
        # Provide a basic summary based on text analysis
        word_count = len(document_text.split())
        char_count = len(document_text)
        return (f"Document Summary: This document contains {word_count} words and {char_count} characters. "
               f"AI analysis is currently unavailable, but the document has been successfully processed and stored. "
               f"You can view the full extracted text in the chat interface.")

    # Try candidates (location x model) until one succeeds
    last_err: Exception | None = None
    for loc in _LOCATION_CANDIDATES:
        try:
            _ensure_vertex_init(loc)
        except Exception as e:
            last_err = e
            continue
        for model_name in _MODEL_CANDIDATES:
            try:
                model = GenerativeModel(model_name)
                prompt = (
        "You are a legal explainer. Summarize the following extracted contract text for a layperson.\n"
        "Return:\n"
        "- 5 bullet executive summary\n"
        "- Key obligations of the user\n"
        "- Key risks and red flags\n"
        "- Termination / renewal / penalty clauses (if present)\n\n"
        "Text:\n" + document_text[:120000]
                )

                resp = model.generate_content(
                    prompt,
                    generation_config=GenerationConfig(
                        temperature=0.2,
                        max_output_tokens=max_tokens,
                    ),
                )

                # Try multiple response shapes depending on SDK version
                text = getattr(resp, "text", None)
                if text and text.strip():
                    return text.strip()

                try:
                    candidates = getattr(resp, "candidates", None) or []
                    for c in candidates:
                        content = getattr(c, "content", None)
                        if not content:
                            continue
                        parts = getattr(content, "parts", None) or []
                        chunk = "".join([getattr(p, "text", "") for p in parts])
                        if chunk.strip():
                            return chunk.strip()
                except Exception:
                    pass
            except Exception as e:
                last_err = e
                continue

    # Exhausted attempts
    if last_err:
        raise last_err
    return ""


def analyze_document_with_gemini(document_text: str, max_tokens: int = 1200) -> Dict[str, Any]:
    """Analyze document with enhanced structured response using Gemini.

    Args:
        document_text: Raw extracted text to analyze.
        max_tokens: Upper bound for response length.

    Returns:
        A dictionary containing structured analysis data.
    """
    if not document_text:
        return {'summary': '', 'extracted_text': document_text}
    
    if not VERTEX_AI_AVAILABLE:
        return {
            'summary': f"Analysis not available (Vertex AI not configured). Document contains {len(document_text.split())} words.",
            'extracted_text': document_text,
            'document_type': 'Unknown',
            'complexity': 'Unknown',
            'risk_level': 'Unknown',
            'risk_factors': ['Vertex AI not configured for analysis'],
            'key_parties': [],
            'word_count': len(document_text.split()),
            'page_count': 'Unknown'
        }

    # Try candidates (location x model) until one succeeds
    last_err: Exception | None = None
    for loc in _LOCATION_CANDIDATES:
        try:
            _ensure_vertex_init(loc)
        except Exception as e:
            last_err = e
            continue
        for model_name in _MODEL_CANDIDATES:
            try:
                model = GenerativeModel(model_name)
                
                # Enhanced prompt for structured analysis
                prompt = f"""
Analyze this legal document and provide a structured response in the following JSON format:

{{
  "documentType": "Contract/Agreement/Policy/Legal Brief/Court Document/Other",
  "complexity": "Simple/Moderate/Complex",
  "riskLevel": "Low/Medium/High",
  "riskFactors": ["Risk factor 1", "Risk factor 2", "Risk factor 3"],
  "keyParties": ["Party 1", "Party 2", "Party 3"],
  "summary": "2-3 sentence overview of the document",
  "extractedText": "{document_text[:120000]}",
  "wordCount": {len(document_text.split())},
  "pageCount": "Estimated based on content length"
}}

Document to analyze:
{document_text[:120000]}

Please analyze this document and return ONLY the JSON response. Do not include any other text or explanations.
"""

                resp = model.generate_content(
                    prompt,
                    generation_config=GenerationConfig(
                        temperature=0.2,
                        max_output_tokens=max_tokens,
                    ),
                )

                # Try multiple response shapes depending on SDK version
                text = getattr(resp, "text", None)
                if text and text.strip():
                    return _parse_gemini_response(text.strip())

                try:
                    candidates = getattr(resp, "candidates", None) or []
                    for c in candidates:
                        content = getattr(c, "content", None)
                        if not content:
                            continue
                        parts = getattr(content, "parts", None) or []
                        chunk = "".join([getattr(p, "text", "") for p in parts])
                        if chunk.strip():
                            return _parse_gemini_response(chunk.strip())
                except Exception:
                    pass
            except Exception as e:
                last_err = e
                continue

    # Exhausted attempts - fallback to original summary
    if last_err:
        print(f"Enhanced analysis failed: {last_err}")
        # Fallback to original summary
        try:
            summary = summarize_with_gemini(document_text, max_tokens)
            return {
                'summary': summary,
                'extracted_text': document_text,
                'document_type': None,
                'complexity': None,
                'risk_level': None,
                'risk_factors': [],
                'key_parties': [],
                'word_count': len(document_text.split()),
                'page_count': None
            }
        except Exception:
            return {
                'summary': '',
                'extracted_text': document_text,
                'document_type': None,
                'complexity': None,
                'risk_level': None,
                'risk_factors': [],
                'key_parties': [],
                'word_count': len(document_text.split()),
                'page_count': None
            }
    
    return {
        'summary': '',
        'extracted_text': document_text,
        'document_type': None,
        'complexity': None,
        'risk_level': None,
        'risk_factors': [],
        'key_parties': [],
        'word_count': len(document_text.split()),
        'page_count': None
    }


