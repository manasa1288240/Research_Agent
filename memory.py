import chromadb
from sentence_transformers import SentenceTransformer

# Load embedding model
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Create Chroma client
client = chromadb.Client()

# Create collection
collection = client.get_or_create_collection(
    name="research_memory"
)

def store_documents(documents):
    """
    Store documents into vector database
    """

    for idx, doc in enumerate(documents):

        # Create embedding
        embedding = embedding_model.encode(doc).tolist()

        # Store in ChromaDB
        collection.add(
            ids=[str(idx)],
            embeddings=[embedding],
            documents=[doc]
        )

def retrieve_relevant(query, top_k=3):
    """
    Retrieve most relevant documents
    """

    # Embed query
    query_embedding = embedding_model.encode(query).tolist()

    # Search vector DB
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k
    )

    return results["documents"][0]