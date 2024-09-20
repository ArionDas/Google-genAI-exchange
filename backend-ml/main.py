from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Union
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_community.utilities import GoogleSerperAPIWrapper, WikipediaAPIWrapper
from langchain_community.tools import YouTubeSearchTool
from langchain.tools import WikipediaQueryRun
from langchain.agents import initialize_agent, Tool
from langchain.chains import LLMChain
from dotenv import load_dotenv
import os
import logging
from GenMCQ import generate_mcqs_with_llm, generate_mcqs_with_google_search, generate_report
from Resources import search_and_summarize


# Initialize FastAPI app
app = FastAPI()
load_dotenv()

# Update CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://google-gen-ai-exchange-git-main-irfaniiitrs-projects.vercel.app/"],  # Update this to match your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define your API keys (consider using environment variables for security)
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
SERPER_API_KEY = os.getenv('SERPER_API_KEY')

# Initialize tools and models
chat = ChatGroq(temperature=0.5, groq_api_key=GROQ_API_KEY, model_name="mixtral-8x7b-32768")
serper = GoogleSerperAPIWrapper(serper_api_key=SERPER_API_KEY)
wikipedia = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper())
youtube = YouTubeSearchTool()

# Define system prompt
system = """
You are a highly effective AI teaching assistant that uses the Socratic method to guide students toward understanding concepts in Data Structures and Algorithms (DSA).
Your role is not to give direct answers but to ask thoughtful, probing questions that lead the student to figure out the solution on their own.
...
"""

# Define conversation history format
def format_conversation_history(history):
    return "\n".join([f"Student: {entry['student']}\nSocratic Assistant: {entry['assistant']}" for entry in history])

# Function to generate a Socratic response considering the conversation history
def socratic_conversation(student_query, history):
    history_text = format_conversation_history(history)
    human = f"""
    {history_text}

    Student: {student_query}

    Respond to the student's query by asking a one relevant question that leads them to the solution.
    If the students response is absolutely correct ,appreciate him and dont ask him further questions.
    """
    prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])
    chain = LLMChain(prompt=prompt, llm=chat)
    return chain.run({"student_query": student_query})

# Define tools
tools = [
    Tool(name="Google Search", func=serper.run, description="Useful for searching the web..."),
    Tool(name="YouTube Search", func=youtube.run, description="Useful for searching YouTube..."),
    Tool(name="Wikipedia Search", func=wikipedia.run, description="Useful for Wikipedia searches...")
]

# Initialize the agent
def initialize_custom_agent():
    agent = initialize_agent(
        tools=tools,
        llm=chat,
        agent_type="chat-conversational-react",
        verbose=False,
        handle_parsing_errors=True
    )
    return agent

# Define API Models
class QueryModel(BaseModel):
    query: str
    history: List[Dict[str, str]] = []

class ResponseModel(BaseModel):
    response: str
    history: List[Dict[str, str]]

class MCQRequest(BaseModel):
    topic: str
    noq: int
    level: str

class MCQResponse(BaseModel):
    mcqs: List[Dict[str, Union[str, List[str], int]]]

class SearchQuery(BaseModel):
    query: str

# Add an OPTIONS endpoint for /query
@app.options("/query")
async def options_query():
    return {"message": "OK"}

# Update the query_agent_endpoint function
@app.post("/query", response_model=ResponseModel)
async def query_agent_endpoint(data: QueryModel):
    # logger.info(f"Received query: {data.query}")
    # logger.info(f"Received history: {data.history}")
    agent = initialize_custom_agent()
    history = [{"student": item["student"], "assistant": item["assistant"]} 
               for item in data.history if item["student"] or item["assistant"]]
    response = socratic_conversation(data.query, history)
    history.append({"student": data.query, "assistant": response})
    return {"response": response, "history": history}

# Add an OPTIONS endpoint for /search
@app.options("/search")
async def options_search():
    return {"message": "OK"}

@app.post("/search")
async def search_endpoint(data: QueryModel):
    # logger.info(f"Received search query: {data.query}")
    query = data.query
    agent = initialize_custom_agent()
    response = agent.run(query)
    return {"response": response}

# Add an OPTIONS endpoint for /generate-mcqs
@app.options("/generate-mcqs")
async def options_generate_mcqs():
    return {"message": "OK"}

@app.post("/generate-mcqs", response_model=MCQResponse)
async def generate_mcqs_endpoint(data: MCQRequest):
    logger.info(f"Received MCQ generation request: Topic: {data.topic}, NoQ: {data.noq}, Level: {data.level}")
    
    mcqs = generate_mcqs_with_llm(data.topic, data.noq, data.level)
    if not mcqs:
        logger.info("Falling back to Google Search for generating MCQs...")
        mcqs = generate_mcqs_with_google_search(data.topic, data.noq)
    
    if not mcqs:
        raise HTTPException(status_code=404, detail="Unable to generate MCQs")
    
    logger.info(f"Generated {len(mcqs)} MCQs")
    return {"mcqs": mcqs}


@app.post("/resources/")
async def search(search_query: SearchQuery):
    print(f"Received search query: {search_query.query}")
    return search_and_summarize(search_query.query)


# To run the server: uvicorn main:app --reload
