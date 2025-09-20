# Enhanced Gemini Prompts for Legal AI

## Updated Prompt for Document Analysis

Replace your current Gemini prompt with this enhanced version to get structured document analysis:

```python
def get_enhanced_analysis_prompt(extracted_text):
    return f"""
Analyze this legal document and provide a structured response in the following JSON format:

{{
  "documentType": "Contract/Agreement/Policy/Legal Brief/Court Document/Other",
  "complexity": "Simple/Moderate/Complex",
  "riskLevel": "Low/Medium/High",
  "riskFactors": ["Risk factor 1", "Risk factor 2", "Risk factor 3"],
  "keyParties": ["Party 1", "Party 2", "Party 3"],
  "summary": "2-3 sentence overview of the document",
  "extractedText": "{extracted_text}",
  "wordCount": {len(extracted_text.split())},
  "pageCount": "Estimated based on content length"
}}

Document to analyze:
{extracted_text}

Please analyze this document and return ONLY the JSON response. Do not include any other text or explanations.
"""

def parse_gemini_response(response_text):
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
            'extracted_text': extracted_text
        }
```

## Backend Integration

Update your document processing endpoint to use the enhanced prompt:

```python
# In your process endpoint
async def process_document_with_enhanced_analysis(document_id, extracted_text):
    try:
        # Get enhanced analysis from Gemini
        enhanced_prompt = get_enhanced_analysis_prompt(extracted_text)
        gemini_response = await call_gemini_api(enhanced_prompt)
        
        # Parse the structured response
        analysis_data = parse_gemini_response(gemini_response)
        
        # Update document with enhanced metadata
        await update_document_metadata(document_id, {
            'summary': analysis_data['summary'],
            'extracted_text': analysis_data['extracted_text'],
            'document_metadata': {
                'documentType': analysis_data['document_type'],
                'complexity': analysis_data['complexity'],
                'riskLevel': analysis_data['risk_level'],
                'riskFactors': analysis_data['risk_factors'],
                'keyParties': analysis_data['key_parties'],
                'wordCount': analysis_data['word_count'],
                'pageCount': analysis_data['page_count']
            }
        })
        
        return analysis_data
        
    except Exception as e:
        print(f"Enhanced analysis failed: {e}")
        # Fallback to original processing
        return await process_document_original(document_id, extracted_text)
```

## Database Schema Update

Add the document_metadata column to your documents table:

```sql
ALTER TABLE documents ADD COLUMN document_metadata JSONB;
```

## Example Response Structure

The enhanced prompt will return data like this:

```json
{
  "documentType": "Contract",
  "complexity": "Moderate",
  "riskLevel": "Medium",
  "riskFactors": [
    "Unclear termination clauses",
    "Payment terms lack specificity",
    "Limited liability protection"
  ],
  "keyParties": [
    "ABC Corporation",
    "XYZ Services LLC"
  ],
  "summary": "This is a service agreement between ABC Corporation and XYZ Services LLC for software development services. The contract outlines payment terms, deliverables, and project timeline.",
  "extractedText": "[Full extracted text...]",
  "wordCount": 1250,
  "pageCount": 3
}
```

## Frontend Features Enabled

With this enhanced data, your frontend will now display:

1. **Risk Warning Bar**: Shows risk level with color-coded warnings
2. **Document Metadata**: Shows document type, complexity, word count, etc.
3. **Enhanced Sidebar**: Shows document type and risk level badges
4. **Key Parties**: Displays important parties involved
5. **Risk Factors**: Lists specific concerns identified

## Testing

To test the enhanced features:

1. Update your backend with the new prompt
2. Process a new document
3. The frontend will automatically display the enhanced information
4. Risk warnings will only show if risk level is detected
5. Document metadata will only show if available

## Fallback Behavior

If the enhanced analysis fails or returns incomplete data:
- The system falls back to the original summary-only approach
- No risk warnings or metadata will be displayed
- The document will still be processed normally

This ensures backward compatibility while adding new features when available.
