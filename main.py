from dotenv import load_dotenv
from tavily import TavilyClient
from openai import OpenAI
import os

load_dotenv()

# OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

# Tavily search
tavily = TavilyClient()

query = input("Enter research topic: ")

print("\nSearching the web...\n")

results = tavily.search(
    query=query,
    search_depth="advanced",
    max_results=5
)

context = ""

for idx, result in enumerate(results["results"], start=1):
    context += f"""
Source {idx}
Title: {result['title']}
Content: {result['content']}
URL: {result['url']}

"""

prompt = f"""
You are an advanced AI research assistant.

Using the following research:

{context}

Generate:
1. Key findings
2. Important insights
3. Challenges
4. Future outlook
5. Final summary

Topic:
{query}
"""

print("Generating AI report...\n")

response = client.chat.completions.create(
    model="openai/gpt-oss-20b:free",
    messages=[
        {"role": "user", "content": prompt}
    ]
)

print("\n===== AI RESEARCH REPORT =====\n")

print(response.choices[0].message.content)