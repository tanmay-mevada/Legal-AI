def split_text(text: str, max_chars: int = 2000):
    chunks, i = [], 0
    while i < len(text):
        j = min(i + max_chars, len(text))
        # try to break on a newline/period
        k = text.rfind("\n", i, j)
        if k == -1:
            k = text.rfind(". ", i, j)
        if k == -1:
            k = j
        chunks.append(text[i:k].strip())
        i = k
    # remove empties
    return [c for c in chunks if c]
