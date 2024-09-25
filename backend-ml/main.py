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
from multimodelHelper import voice_input, llm_model_audio, llm_model_image, llm_model_video, text_to_speech



# Initialize FastAPI app
app = FastAPI()
load_dotenv()

# Update CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://google-gen-ai-exchange-git-main-irfaniiitrs-projects.vercel.app",
        "https://google-genai-exchange-1.onrender.com",
        "https://google-gen-ai-exchange.vercel.app"  # Add this line if it's your Vercel domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define your API keys (consider using environment variables for security)
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
SERPER_API_KEY = os.getenv('SERPER_API_KEY')

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

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


# @app.post("/resources/")
# async def search(search_query: SearchQuery):
#     print(f"Received search query: {search_query.query}")
#     return search_and_summarize(search_query.query)


@app.post("/resources")
async def search_query(payload: SearchQuery):
    try:
        query = payload.query
        print(f"Received search query: {query}")
        results = searchResources(query)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))





 
# Voice Chat Endpoint
@app.post("/voice-chat")
async def voice_chat(audio: UploadFile = File(...)):
    try:
        # Create a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            # Write the uploaded audio to the temporary file
            temp_file.write(await audio.read())
            temp_file_path = temp_file.name

        print(f"Temporary file created at: {temp_file_path}")
        
        # Process the audio file
        text = voice_input(temp_file_path)
        print(f"Transcribed text: {text}")
        
        response = llm_model_audio(text)
        print(f"LLM response: {response}")
        
        # Convert response to speech and save the audio file
        text_to_speech(response)
        
        # Clean up the temporary audio file
        os.unlink(temp_file_path)
        
        return JSONResponse(content={"text_response": response}, status_code=200)
    except Exception as e:
        print(f"Error in voice chat: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

# Image + Text + Voice Query Endpoint
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

    # Use the helper function to process the image + text query
    response = llm_model_image(query_text, image_path)
    print(f"Response: {response}")
    
    # Convert response to speech and return it
    text_to_speech(response)
    return JSONResponse(content={"text_response": response}, status_code=200)

# Video + Text + Voice Query Endpoint
@app.post("/video-query")
async def video_query(
    video: UploadFile = File(...),
    query_text: str = Form(...)
):
    # Save the uploaded video
    video_path = "temp_video.mp4"
    with open(video_path, "wb") as f:
        f.write(await video.read())

    # Use the helper function to process the video + text query
    response = llm_model_video(query_text, video_path)
    
    # Convert response to speech and return it
    text_to_speech(response)
    return JSONResponse(content={"text_response": response}, status_code=200)

# Endpoint to download the generated speech file
@app.get("/download-audio")
def download_audio():
    audio_file_path = "speech.mp3"
    if os.path.exists(audio_file_path):
        return FileResponse(path=audio_file_path, media_type='audio/mp3', filename="speech.mp3")
    return JSONResponse(content={"error": "Audio file not found"}, status_code=404)


# To run the server: uvicorn main:app --reload
