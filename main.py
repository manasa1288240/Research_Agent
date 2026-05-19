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
    max_results=15
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
print("\n===== RETRIEVED CONTEXT =====\n")
print(retrieved_context)

print("Retrieving relevant information...\n")

# Prompt for LLM
prompt = f"""
You are an elite AI research analyst specializing in comprehensive, detailed research reports.

Your task is to generate an EXTENSIVE, PROFESSIONAL, deeply researched report covering the topic thoroughly.

CRITICAL REQUIREMENTS:
- Provide COMPREHENSIVE detail and analysis
- Use professional markdown formatting with multiple sections
- Explain all concepts thoroughly with context
- Include detailed bullet points with explanations
- Include current trends, developments, and market status
- Include detailed discussion of risks, challenges, and opportunities
- Include future implications, predictions, and outlook (2-5 years)
- Use ALL provided research context and cite insights from sources
- Include data points, statistics, and concrete examples where relevant
- Provide actionable insights and recommendations

OUTPUT FORMAT:

# Research Report: {query}

## Executive Summary
Comprehensive 2-3 paragraph overview

## Current State & Overview
Detailed current situation and latest developments

## Key Findings & Core Insights
Detailed findings with explanations

## Major Technologies, Trends & Developments
Thorough discussion of trends with implications

## Applications, Use Cases & Implementations
Specific applications with detailed descriptions

## Market Impact, Opportunities & Business Implications
Detailed market analysis and business opportunities

## Risks, Challenges, Limitations & Barriers
In-depth discussion of obstacles and risks

## Key Players, Competitors & Ecosystem
Industry landscape and major organizations

## Future Outlook, Predictions & Implications
Forward-looking analysis (2-5 years)

## Recommendations & Action Items
Practical recommendations and next steps

## Final Conclusion
Comprehensive summary and key takeaways

USER QUERY:
{query}

RESEARCH CONTEXT:
{retrieved_context}

IMPORTANT: Generate 2000+ words of comprehensive, detailed analysis. Be thorough and professional.
"""

print("Generating AI report...\n")

# Generate response
response = client.chat.completions.create(
    model="openai/gpt-oss-20b:free",
    messages=[
        {"role": "user", "content": prompt}
    ],
    temperature=0.7,
    max_tokens=4000
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