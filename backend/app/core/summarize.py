import os, openai
openai.api_key = os.getenv("OPENAI_API_KEY")

SYS = "You are a legal explainer. You simplify contracts in plain English without giving legal advice."
USER_TMPL = """Summarize the following legal document for a layperson.
- Give 5 bullet executive summary
- List key obligations of the user
- List key risks and red flags
- Mention termination/renewal/penalty clauses if any
Document text:\n\n{}"""

def summarize(text: str) -> str:
    prompt = USER_TMPL.format(text[:30000])  # basic safeguard
    resp = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role":"system","content":SYS},{"role":"user","content":prompt}],
        temperature=0.2, max_tokens=900,
    )
    return resp.choices[0].message.content.strip()
