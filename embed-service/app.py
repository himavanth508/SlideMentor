from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI()

# Load model ONCE to GPU if available
print("Loading embedding model...")
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
print("Model loaded successfully!")

class TextInput(BaseModel):
    text: str

@app.post("/embed")
def embed(input: TextInput):
    print("Generating embedding...")
    embedding = model.encode(input.text, convert_to_numpy=True).tolist()
    return {"embedding": embedding}

## python microservice -- 8000
## frontend -- 5173
## backend -- 5000
