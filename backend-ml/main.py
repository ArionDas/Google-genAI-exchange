from fastapi import FastAPI, HTTPException, Query, Body, UploadFile, File, Form
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
import tempfile
from GenMCQ import generate_mcqs_with_llm, generate_mcqs_with_google_search, generate_report
from Resources import searchResources
from fastapi.responses import FileResponse, JSONResponse
from multimodelHelper import llm_model_audio, llm_model_image, llm_model_video, text_to_speech
import uvicorn

# Initialize FastAPI app
app = FastAPI()
load_dotenv()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables (API keys)
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
"""

# Format conversation history for Socratic conversation
def format_conversation_history(history):
    return "\n".join([f"Student: {entry['student']}\nSocratic Assistant: {entry['assistant']}" for entry in history])

# Function to generate a Socratic response based on conversation history
def socratic_conversation(student_query, history):
    history_text = format_conversation_history(history)
    human = f"""
    {history_text}

    Student: {student_query}

    Respond to the student's query by asking one relevant question that leads them to the solution.
    If the student's response is absolutely correct, appreciate them and don't ask further questions.
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

# Initialize agent with tools
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

# Add OPTIONS endpoint for CORS preflight requests
@app.options("/query")
async def options_query():
    return {"message": "OK"}

@app.post("/query", response_model=ResponseModel)
async def query_agent_endpoint(data: QueryModel):
    agent = initialize_custom_agent()
    history = [{"student": item["student"], "assistant": item["assistant"]} 
               for item in data.history if item["student"] or item["assistant"]]
    response = socratic_conversation(data.query, history)
    history.append({"student": data.query, "assistant": response})
    return {"response": response, "history": history}

@app.options("/search")
async def options_search():
    return {"message": "OK"}

@app.post("/search")
async def search_endpoint(data: QueryModel):
    query = data.query
    agent = initialize_custom_agent()
    response = agent.run(query)
    return {"response": response}

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

@app.post("/resources")
async def search_query(payload: SearchQuery):
    try:
        query = payload.query
        print(f"Received search query: {query}")
        results = searchResources(query)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Image Query Endpoint
@app.post("/image-query")
async def image_query(
    image: UploadFile = File(...),
    query_text: str = Form(...)
):
    print(f"Received image query: {query_text}")
    # Save the uploaded image
    image_path = f"temp_image.{image.filename.split('.')[-1]}"
    with open(image_path, "wb") as f:
        f.write(await image.read())

    # Process the image + text query
    response = llm_model_image(query_text, image_path)
    print(f"Response: {response}")
    
    # Convert response to speech and return it
    text_to_speech(response)
    response = JSONResponse(content={"text_response": response}, status_code=200)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

# Video Query Endpoint
@app.post("/video-query")
async def video_query(
    video: UploadFile = File(...),
    query_text: str = Form(...)
):
    # Save the uploaded video
    video_path = "temp_video.mp4"
    with open(video_path, "wb") as f:
        f.write(await video.read())

    # Process the video + text query
    response = llm_model_video(query_text, video_path)
    
    # Convert response to speech and return it
    text_to_speech(response)
    response = JSONResponse(content={"text_response": response}, status_code=200)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

# Endpoint to download the generated speech file
@app.get("/download-audio")
def download_audio():
    audio_file_path = "speech.mp3"
    if os.path.exists(audio_file_path):
        response = FileResponse(path=audio_file_path, media_type='audio/mp3', filename="speech.mp3")
        response.headers["Access-Control-Allow-Origin"] = "*"
        return response
    return JSONResponse(content={"error": "Audio file not found"}, status_code=404)

# Start the server
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
