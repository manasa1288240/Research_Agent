from memory import store_documents, retrieve_relevant

documents = [
    "AI is transforming healthcare.",
    "Humanoid robots may assist elderly patients.",
    "Machine learning improves diagnostics.",
    "Robotics in surgery is growing rapidly."
]

store_documents(documents)

query = "How are robots helping medicine?"

results = retrieve_relevant(query)

print("\nRelevant Results:\n")

for r in results:
    print("-", r)