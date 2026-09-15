"""
Convert GridGuard AI docs/*.md files to styled PDF using:
  1. Python `markdown` library → HTML with embedded CSS
  2. Edge headless --print-to-pdf → PDF output
"""

import os
import sys
import subprocess
import markdown

DOCS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs")

# Professional Corporate Standard CSS (Pure Black & White Formal Executive Formatting)
CSS = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: 'Inter', Arial, sans-serif;
    background: #ffffff !important;
    color: #000000 !important;
    padding: 40px 50px;
    line-height: 1.6;
    font-size: 13px;
}

h1 {
    font-size: 24px;
    font-weight: 700;
    color: #000000 !important;
    border-bottom: 2px solid #000000;
    padding-bottom: 8px;
    margin-bottom: 24px;
    margin-top: 10px;
    letter-spacing: -0.01em;
}

h2 {
    font-size: 18px;
    font-weight: 700;
    color: #000000 !important;
    margin-top: 30px;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #000000;
}

h3 {
    font-size: 15px;
    font-weight: 700;
    color: #000000 !important;
    margin-top: 22px;
    margin-bottom: 10px;
}

h4 {
    font-size: 13px;
    font-weight: 700;
    color: #000000 !important;
    margin-top: 16px;
    margin-bottom: 6px;
}

p {
    margin-bottom: 12px;
    color: #000000 !important;
}

strong {
    color: #000000 !important;
    font-weight: 700;
}

em {
    color: #000000 !important;
    font-style: italic;
}

a {
    color: #000000 !important;
    text-decoration: underline;
}

ul, ol {
    margin-left: 20px;
    margin-bottom: 14px;
}

li {
    margin-bottom: 4px;
    color: #000000 !important;
}

code {
    font-family: 'JetBrains Mono', 'Consolas', monospace;
    background: #f4f4f4;
    color: #000000 !important;
    padding: 2px 5px;
    border-radius: 3px;
    font-size: 12px;
    border: 1px solid #cccccc;
}

pre {
    background: #f8f9fa;
    border: 1px solid #000000;
    border-radius: 4px;
    padding: 14px 16px;
    overflow-x: auto;
    margin-bottom: 16px;
    margin-top: 6px;
}

pre code {
    background: transparent;
    border: none;
    padding: 0;
    color: #000000 !important;
    font-size: 12px;
    line-height: 1.5;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
    margin-top: 8px;
    font-size: 12px;
}

thead th {
    background: #f0f0f0;
    color: #000000 !important;
    font-weight: 700;
    text-align: left;
    padding: 8px 12px;
    border: 1px solid #000000;
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

tbody td {
    padding: 8px 12px;
    border: 1px solid #000000;
    color: #000000 !important;
    vertical-align: top;
}

blockquote {
    border-left: 3px solid #000000;
    background: #f9f9f9;
    padding: 12px 16px;
    margin-bottom: 16px;
    color: #000000 !important;
}

blockquote p {
    margin-bottom: 4px;
}

hr {
    border: none;
    border-top: 1px solid #000000;
    margin: 24px 0;
}

h1, h2 {
    page-break-after: avoid;
}

@media print {
    body {
        background: #ffffff !important;
        color: #000000 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
    
    @page {
        size: A4;
        margin: 0.6in;
    }
}

.doc-footer {
    margin-top: 40px;
    padding-top: 12px;
    border-top: 1px solid #000000;
    text-align: center;
    color: #000000 !important;
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.05em;
}
"""

MD_FILES = [
    "problem-statement.md",
    "solution-overview.md",
    "architecture.md",
    "setup-guide.md",
]

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"


def md_to_html(md_content: str, title: str) -> str:
    """Convert markdown to fully styled HTML document."""
    extensions = ['tables', 'fenced_code', 'codehilite', 'toc', 'nl2br']
    html_body = markdown.markdown(md_content, extensions=extensions)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} — GridGuard AI</title>
    <style>{CSS}</style>
</head>
<body>
    {html_body}
    <div class="doc-footer">
        GRIDGUARD AI — IBM BOB AI HACKATHON 2026 — TEAM GRIDGUARD AI — CONFIDENTIAL
    </div>
</body>
</html>"""


def html_to_pdf(html_path: str, pdf_path: str):
    """Use Edge headless to print HTML to PDF."""
    abs_html = os.path.abspath(html_path)
    abs_pdf = os.path.abspath(pdf_path)
    file_url = f"file:///{abs_html.replace(os.sep, '/')}"
    
    cmd = [
        EDGE_PATH,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--run-all-compositor-stages-before-draw",
        "--no-pdf-header-footer",
        f"--print-to-pdf={abs_pdf}",
        file_url
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    return result.returncode == 0


def main():
    temp_dir = os.path.join(DOCS_DIR, "_temp_html")
    os.makedirs(temp_dir, exist_ok=True)

    success_count = 0

    for md_file in MD_FILES:
        md_path = os.path.join(DOCS_DIR, md_file)
        if not os.path.exists(md_path):
            print(f"[SKIP] {md_file} not found")
            continue

        pdf_name = md_file.replace(".md", ".pdf")
        pdf_path = os.path.join(DOCS_DIR, pdf_name)
        html_path = os.path.join(temp_dir, md_file.replace(".md", ".html"))

        print(f"[PROCESSING] {md_file} -> {pdf_name}")

        # Read markdown
        with open(md_path, "r", encoding="utf-8") as f:
            md_content = f.read()

        # Convert to styled HTML
        title = md_file.replace(".md", "").replace("-", " ").title()
        html_content = md_to_html(md_content, title)

        # Write temp HTML
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        # Convert HTML → PDF via Edge
        if html_to_pdf(html_path, pdf_path):
            file_size = os.path.getsize(pdf_path)
            print(f"[SUCCESS] {pdf_name} ({file_size:,} bytes)")
            success_count += 1
        else:
            print(f"[ERROR] Failed to generate {pdf_name}")

    # Cleanup temp HTML files
    import shutil
    shutil.rmtree(temp_dir, ignore_errors=True)

    print(f"\n[DONE] {success_count}/{len(MD_FILES)} PDFs generated in docs/")


if __name__ == "__main__":
    main()
