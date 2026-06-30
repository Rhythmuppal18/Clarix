import fitz  # PyMuPDF
import docx
import pandas as pd

def parse_pdf(file_path: str) -> str:
    """Extracts text from a PDF file."""
    doc = fitz.open(file_path)
    text = "\n".join([page.get_text() for page in doc])
    return text

def parse_docx(file_path: str) -> str:
    """Extracts text from a DOCX file."""
    doc = docx.Document(file_path)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text

def parse_csv(file_path: str) -> str:
    """Extracts text from a CSV file by converting it to string."""
    df = pd.read_csv(file_path)
    return df.to_string(index=False)
