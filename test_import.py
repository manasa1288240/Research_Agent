#!/usr/bin/env python
import sys
print("Step 1: Starting import test...")
sys.stdout.flush()

print("Step 2: Importing chromadb...")
sys.stdout.flush()
import chromadb
print("Step 2a: ChromaDB imported")
sys.stdout.flush()

print("Step 3: Importing sentence_transformers...")
sys.stdout.flush()
from sentence_transformers import SentenceTransformer
print("Step 3a: SentenceTransformer imported")
sys.stdout.flush()

print("Step 4: Importing logging...")
sys.stdout.flush()
import logging
print("Step 4a: Logging imported")
sys.stdout.flush()

print("Step 5: About to import memory functions...")
sys.stdout.flush()

print("Step 5a: Importing store_documents...")
sys.stdout.flush()
from memory import store_documents
print("Step 5b: store_documents imported!")
sys.stdout.flush()

print("Step 5c: Importing retrieve_relevant...")
sys.stdout.flush()
from memory import retrieve_relevant
print("Step 5d: retrieve_relevant imported!")
sys.stdout.flush()

print("SUCCESS: All imports completed!")
sys.stdout.flush()
