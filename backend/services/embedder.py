import os
from typing import List

# Lazy import keeps startup light and avoids eager model loading in deployment.
try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover - dependency may be unavailable in some environments
    SentenceTransformer = None

# Global embedder instance
_embedding_model = None
_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
_BATCH_SIZE = int(os.getenv("EMBEDDING_BATCH_SIZE", "8"))


def load_embedding_model():
    """Loads the sentence-transformers model ONCE when needed."""
    global _embedding_model
    if _embedding_model is None:
        if SentenceTransformer is None:
            raise RuntimeError("sentence-transformers is not available")
        print(f"Loading embedding model ({_MODEL_NAME})...")
        _embedding_model = SentenceTransformer(_MODEL_NAME, device="cpu")
        print("Embedding model loaded.")
    return _embedding_model


def get_embedder():
    """Returns the loaded global embedding model, loading it first if necessary."""
    if _embedding_model is None:
        load_embedding_model()
    return _embedding_model


def encode_texts(texts: List[str], batch_size: int | None = None) -> List[list[float]]:
    """Encode text in smaller batches to reduce peak memory usage in deployment."""
    if not texts:
        return []

    embedder = get_embedder()
    actual_batch_size = batch_size or _BATCH_SIZE
    embeddings: List[list[float]] = []
    for start in range(0, len(texts), actual_batch_size):
        batch = texts[start:start + actual_batch_size]
        batch_embeddings = embedder.encode(
            batch,
            batch_size=len(batch),
            convert_to_numpy=False,
            normalize_embeddings=False,
            show_progress_bar=False,
        )
        embeddings.extend([list(item) for item in batch_embeddings])
    return embeddings
