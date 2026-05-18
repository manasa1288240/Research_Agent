from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from tavily import TavilyClient
from openai import OpenAI
from memory import store_documents, retrieve_relevant
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize clients with error handling
try:
    logger.info("Initializing OpenAI client...")
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY")
    )
    logger.info("✓ OpenAI client initialized")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")
    client = None

try:
    logger.info("Initializing Tavily client...")
    tavily_api_key = os.getenv("TAVILY_API_KEY")
    if not tavily_api_key:
        raise ValueError("TAVILY_API_KEY is not set in environment")
    tavily = TavilyClient(api_key=tavily_api_key)
    logger.info("✓ Tavily client initialized")
except Exception as e:
    logger.error(f"Failed to initialize Tavily client: {e}")
    tavily = None

# Store conversation history
conversation_history = []

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "Research Agent Backend"})

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat endpoint that processes research queries"""
    try:
        data = request.json
        user_message = data.get('message', '')
        agent = data.get('agent', 'Coordinator')
        language = data.get('language', 'English')
        history = data.get('history', [])
        
        if not user_message:
            return jsonify({"error": "Message is required"}), 400
        
        # Add to conversation history
        conversation_history.append({
            "role": "user",
            "content": user_message
        })
        
        # Check if the query is about research/searching
        is_research_query = any(keyword in user_message.lower() 
                               for keyword in ['search', 'research', 'find', 'analyze', 'report', 'data', 'information'])
        
        retrieved_context = ""
        
        if is_research_query and tavily:
            try:
                # Perform web search using Tavily
                logger.info(f"Searching web for: {user_message}")
                search_results = tavily.search(
                    query=user_message,
                    search_depth="advanced",
                    max_results=5
                )
                
                # Store search results into memory
                documents = []
                for result in search_results["results"]:
                    documents.append(result["content"])
                
                store_documents(documents)
                
                # Retrieve most relevant documents
                relevant_docs = retrieve_relevant(user_message)
                retrieved_context = "\n".join(relevant_docs) if relevant_docs else ""
                logger.info(f"Retrieved {len(relevant_docs)} relevant documents")
                
            except Exception as e:
                logger.error(f"Web search error: {e}")
                retrieved_context = ""
        
        if is_research_query:
            # Build comprehensive prompt
            prompt = f"""You are an elite AI research analyst working as the {agent} agent.
Current Language: {language}

User Query:
{user_message}

Relevant Research Sources:
{retrieved_context if retrieved_context else "No search results available. Please provide a general response based on your knowledge."}

Please provide a comprehensive, well-structured response.
Format your response with clear sections using markdown.
Be factual, analytical, and professional.
Include key findings, insights, and any relevant trends or implications."""
        
        else:
            # Regular conversation without research
            retrieved_context_list = retrieve_relevant(user_message) if conversation_history else []
            context_text = "\n".join(retrieved_context_list) if retrieved_context_list else "No previous context."
            
            prompt = f"""You are the {agent} agent in a research assistant system.
Current Language: {language}
Conversation Context: {context_text}

User Message: {user_message}

Provide a helpful, professional response."""
        
        # Get response from LLM
        if not client:
            return jsonify({"error": "LLM client not available", "success": False}), 503
            
        try:
            logger.info(f"Calling LLM with agent: {agent}")
            response = client.chat.completions.create(
                model="openai/gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": f"You are the {agent} agent in a multi-agent research system. Respond in {language}."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            assistant_message = response.choices[0].message.content
            
            # Add to history
            conversation_history.append({
                "role": "assistant",
                "content": assistant_message
            })
            
            logger.info("LLM response generated successfully")
            return jsonify({
                "text": assistant_message,
                "agent": agent,
                "success": True
            })
        except Exception as llm_error:
            logger.error(f"LLM Error: {llm_error}")
            return jsonify({
                "error": f"LLM Error: {str(llm_error)}", 
                "success": False
            }), 500
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({"error": str(e), "success": False}), 500

@app.route('/api/research', methods=['POST'])
def research():
    """Dedicated research endpoint for advanced research requests"""
    try:
        data = request.json
        query = data.get('query', '')
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
        
        if not tavily:
            return jsonify({"error": "Tavily search not available", "success": False}), 503
        
        try:
            # Search the web
            logger.info(f"Research query: {query}")
            search_results = tavily.search(
                query=query,
                search_depth="advanced",
                max_results=5
            )
            
            # Store documents
            documents = []
            for result in search_results["results"]:
                documents.append(result["content"])
            
            store_documents(documents)
            
            # Retrieve relevant documents
            relevant_docs = retrieve_relevant(query)
            retrieved_context = "\n".join(relevant_docs) if relevant_docs else "No search results available."
            
            # Generate research report
            prompt = f"""You are an elite AI research analyst.

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

# Research Report: {query}

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
            
            if not client:
                return jsonify({"error": "LLM not available", "success": False}), 503
            
            response = client.chat.completions.create(
                model="openai/gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=3000
            )
            
            report = response.choices[0].message.content
            logger.info("Research report generated successfully")
            
            return jsonify({
                "report": report,
                "query": query,
                "sources_count": len(documents),
                "success": True
            })
        except Exception as search_error:
            logger.error(f"Research processing error: {search_error}")
            return jsonify({"error": str(search_error), "success": False}), 500
        
    except Exception as e:
        logger.error(f"Error in research endpoint: {str(e)}")
        return jsonify({"error": str(e), "success": False}), 500

@app.route('/api/clear-history', methods=['POST'])
def clear_history():
    """Clear conversation history"""
    global conversation_history
    conversation_history = []
    return jsonify({"success": True, "message": "History cleared"})

@app.route('/api/agents', methods=['GET'])
def get_agents():
    """Get available agents"""
    agents = [
        {"id": "Coordinator", "label": "Central Coordinator", "desc": "Routes tasks and synthesizes views"},
        {"id": "Researcher", "label": "Deep Researcher", "desc": "Detailed data gathering and fact finding"},
        {"id": "Analyst", "label": "Data Analyst", "desc": "Quantitative analysis and pattern detection"},
        {"id": "Security", "label": "Security Auditor", "desc": "Compliance and safety check"},
    ]
    return jsonify(agents)

if __name__ == '__main__':
    logger.info("=" * 50)
    logger.info("Starting Research Agent Backend")
    logger.info("=" * 50)
    logger.info(f"OpenAI Client: {'✓ Ready' if client else '✗ Not available'}")
    logger.info(f"Tavily Client: {'✓ Ready' if tavily else '✗ Not available'}")
    logger.info("=" * 50)
    logger.info("Running on http://localhost:5000")
    logger.info("=" * 50)
    app.run(debug=True, port=5000, host='0.0.0.0')
