from dotenv import load_dotenv
from tavily import TavilyClient
from openai import OpenAI
from memory import store_documents, retrieve_relevant
import os

# Load environment variables
load_dotenv()

# OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

# Tavily search client
tavily = TavilyClient()

# User input
query = input("Enter research topic: ")

print("\nSearching the web...\n")

# Search the web
results = tavily.search(
    query=query,
    search_depth="advanced",
    max_results=5
)

# Store web search results into memory
documents = []

for result in results["results"]:
    documents.append(result["content"])

store_documents(documents)

print("Research stored into memory.\n")

# Retrieve most relevant documents
relevant_docs = retrieve_relevant(query)

# Combine retrieved documents
retrieved_context = "\n".join(relevant_docs)

print("Retrieving relevant information...\n")

# Prompt for LLM
prompt = f"""
You are an elite AI research analyst.

Using the provided research sources, create a professional research report.

REQUIREMENTS:
- Use clear markdown formatting
- Include headings
- Include bullet points
- Be factual and concise
- Mention important trends
- Mention risks/challenges
- Mention future implications

FORMAT:

# Title

## Executive Summary

## Key Findings

## Major Insights

## Challenges and Risks

## Future Outlook

## Final Conclusion

Research Topic:
{query}

Relevant Research Sources:
{retrieved_context}
"""

print("Generating AI report...\n")

# Generate response
response = client.chat.completions.create(
    model="openai/gpt-oss-20b:free",
    messages=[
        {"role": "user", "content": prompt}
    ]
)

# Extract report
report = response.choices[0].message.content

# Print report
print("\n===== AI RESEARCH REPORT =====\n")
print(report)

# Save report
with open("report.md", "w", encoding="utf-8") as f:
    f.write(report)

print("\nReport saved as report.md")