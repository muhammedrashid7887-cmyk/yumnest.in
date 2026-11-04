---
name: markitdown
description: Convert files (PDF, DOCX, PPTX, XLSX, HTML, images, audio) to Markdown with Microsoft markitdown. Use when the user wants to read/convert/extract text from an Office/PDF/media file, or asks to "markdown this file".
---

# markitdown

Convert a file to Markdown via Microsoft's markitdown (installed locally).

## Command

CLI is not on PATH — always use:
```powershell
& "$env:APPDATA\Python\Python313\Scripts\markitdown.exe" <file> [-o out.md]
# or
python -m markitdown <file>
```

## Rules
- To stdout: run without `-o`; redirect with `> file.md` if saving
- stdin works: pipe content in with `-x` extension hint if needed
- If missing module: `pip install markitdown`
- Skip Azure `-d` / Document Intelligence flags — offline only
