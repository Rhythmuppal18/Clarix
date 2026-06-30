import os
import chromadb
from chromadb.config import Settings
from dotenv import load_dotenv

load_dotenv()

# Using a new path to bypass SQLite schema mismatch errors caused by ChromaDB version changes
raw_path = os.getenv("CHROMA_DB_PATH", "./chroma_db")
CHROMA_DB_PATH = f"{raw_path}_v4" if not raw_path.endswith("_v4") else raw_path

# Initialize ChromaDB persistent client ONCE
try:
    chroma_client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
except Exception as e:
    print(f"Error initializing ChromaDB: {e}")
    chroma_client = None

def get_collection(org_id: str):
    """
    Returns the ChromaDB collection for the specific organization.
    Collection name pattern strictly clarix_{org_id}.
    Creates the collection if it doesn't exist.
    """
    collection_name = f"clarix_{org_id}"
    return chroma_client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"} # Default distance metric
    )

def add_chunks(org_id: str, chunks: list[str], embeddings: list[list[float]], metadatas: list[dict]):
    """
    Adds embedded text chunks to the organization's vector store.
    """
    collection = get_collection(org_id)
    ids = [f"{m['doc_id']}_{m['chunk_index']}" for m in metadatas]
    
    collection.add(
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas,
        ids=ids
    )

def query_chunks(org_id: str, query_embedding: list[float], top_k: int = 5) -> list[dict]:
    """
    Queries the organization's vector store for the top_k most similar chunks.
    """
    collection = get_collection(org_id)
    # Query expects list of lists for embeddings
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas"]
    )
    
    if not results['documents'][0]:
        return []
        
    formatted_results = []
    for doc, meta in zip(results['documents'][0], results['metadatas'][0]):
        formatted_results.append({
            "text": doc,
            "filename": meta.get("filename"),
            "chunk_index": meta.get("chunk_index"),
            "doc_id": meta.get("doc_id")
        })
    return formatted_results

def query_chunks_scoped(
  org_id: str,
  question_embedding: list,
  selected_doc_ids: list = [],
  top_k: int = 5
):
  collection = get_collection(org_id)
  
  if selected_doc_ids and len(selected_doc_ids) > 0:
    where_filter = {
      "$and": [
        { "org_id": { "$eq": org_id } },
        { "doc_id": { "$in": selected_doc_ids } }
      ]
    }
  else:
    where_filter = { "org_id": { "$eq": org_id } }
  
  results = collection.query(
    query_embeddings=[question_embedding],
    n_results=top_k,
    where=where_filter
  )
  return results

def delete_document(org_id: str, doc_id: str):
    """
    Deletes all chunks from ChromaDB belonging to a specific document.
    """
    collection = get_collection(org_id)
    collection.delete(
        where={"doc_id": doc_id}
    )
