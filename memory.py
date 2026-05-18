import chromadb
from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)

# Initialize variables as None - will be loaded lazily
embedding_model = None
client = None
collection = None

def _initialize():
    """Lazy initialization of embedding model and database"""
    global embedding_model, client, collection
    
    if embedding_model is None:
        try:
            logger.info("Loading embedding model...")
            embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            logger.info("Using fallback embedding method")
            embedding_model = None
    
    if client is None:
        try:
            client = chromadb.Client()
            collection = client.get_or_create_collection(name="research_memory")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")

# Initialize on import, but don't fail if it can't connect
try:
    _initialize()
except Exception as e:
    logger.error(f"Initialization error: {e}")

def store_documents(documents):
    """
    Store documents into vector database
    """
    global embedding_model, collection
    
    try:
        _initialize()
        
        if embedding_model is None or collection is None:
            logger.warning("Embedding model or collection not available, skipping storage")
            return
        
        for idx, doc in enumerate(documents):
            try:
                # Create embedding
                embedding = embedding_model.encode(doc).tolist()

                # Store in ChromaDB
                collection.add(
                    ids=[str(idx)],
                    embeddings=[embedding],
                    documents=[doc]
                )
            except Exception as e:
                logger.error(f"Error storing document {idx}: {e}")
                continue
    except Exception as e:
        logger.error(f"Error in store_documents: {e}")

def retrieve_relevant(query, top_k=3):
    """
    Retrieve most relevant documents
    """
    global embedding_model, collection
    
    try:
        _initialize()
        
        if embedding_model is None or collection is None:
            logger.warning("Embedding model or collection not available, returning empty results")
            return []
        
        # Embed query
        query_embedding = embedding_model.encode(query).tolist()

        # Search vector DB
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )

        return results["documents"][0] if results["documents"] else []
    except Exception as e:
        logger.error(f"Error retrieving relevant documents: {e}")
        return []