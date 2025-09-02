import os
from typing import Optional

import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig


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


