import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def call_gemini(retrieved_chunks: list[dict], user_question: str) -> str:
    """
    Constructs the prompt securely isolated to the provided context 
    and calls Google Gemini 1.5 Flash.
    """
    
    # Format context blocks clearly
    context_parts = []
    for chunk in retrieved_chunks:
        # Use simple dictionary gets, depending on the structure returned by chroma
        text = chunk.get("text", "")
        filename = chunk.get("filename", "Unknown")
        context_parts.append(f"[Source: {filename}]\n{text}")
        
    context_text = "\n\n---\n\n".join(context_parts)
    
    system_prompt = f"""You are Clarix, an enterprise knowledge assistant.

STRICT RULES:
1. Answer ONLY using the provided context below
2. Never use your training data or the internet
3. If the answer is not in the context, say exactly:
   'I could not find this information in your organisation's documents.'
4. Always mention which document the answer came from
5. Be concise, accurate and professional

Context:
{context_text}

Question: {user_question}

Answer:"""

    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content(
        system_prompt,
        generation_config=genai.types.GenerationConfig(temperature=0.1)
    )

    return response.text
