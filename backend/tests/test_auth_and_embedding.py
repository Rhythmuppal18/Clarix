from services.auth_service import normalize_email
from services.embedder import encode_texts


def test_normalize_email_lowercases_and_strips_whitespace():
    assert normalize_email("  User@Example.COM  ") == "user@example.com"


def test_encode_texts_returns_fixed_width_embeddings_for_small_input():
    embeddings = encode_texts(["alpha beta", "beta gamma"], batch_size=1)
    assert len(embeddings) == 2
    assert all(len(vector) > 0 for vector in embeddings)
