from langchain.agents import initialize_agent, Tool
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain_groq import ChatGroq
from langchain_community.utilities import GoogleSerperAPIWrapper
from typing import List, Dict
from dotenv import load_dotenv
import os
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
SERPER_API_KEY = os.getenv('SERPER_API_KEY')

# Initialize ChatGroq model with the correct API key and parameters
chat = ChatGroq(temperature=0.5, groq_api_key=GROQ_API_KEY, model_name="llama3-70b-8192")

# Initialize the Google search tool (using Serper API)
serper = GoogleSerperAPIWrapper(serper_api_key=SERPER_API_KEY)

# Define system prompt for MCQ generation
mcq_system = """
You are a highly knowledgeable AI that generates multiple-choice questions (MCQs) on topics related to Data Structures and Algorithms (DSA) like stack, queue and so on.
Generate {noq} MCQs on the given topic to assess the student's understanding. Make the questions of {level} level. Each MCQ should have:
1. A clear question.
2. Four answer choices.
3. The correct answer marked with 'Correct:' before the option. This should be done at the end after mentioning all the options of the question.
Ensure that the questions cover different areas of the topic.
"""

def generate_mcqs_with_llm(topic: str, noq: int, level: str) -> List[Dict]:
    human = f"Generate {noq} MCQs on the topic: {topic}"
    prompt = ChatPromptTemplate.from_messages([("system", mcq_system), ("human", human)])
    chain = LLMChain(prompt=prompt, llm=chat)
    
    try:
        response = chain.run({"topic": topic, "noq": noq, "level": level})
        logger.info(f"LLM Response: {response}")
        
        mcqs = parse_mcqs_from_response(response)
        if not mcqs:
            logger.warning("No MCQs parsed from the LLM response.")
            return []
        return mcqs
    except Exception as e:
        logger.error(f"Error in generate_mcqs_with_llm: {e}")
        return []

def parse_mcqs_from_response(response: str) -> List[Dict]:
    mcqs = []
    questions = response.split("**MCQ")
    
    for q in questions[1:]:
        if "Correct:" in q:
            try:
                question_part, correct_part = q.split("Correct:")
                lines = question_part.split("\n")
                options = [line.split(") ")[1].strip() for line in lines if line.strip()[:2] in ['A)', 'B)', 'C)', 'D)']]
                question = question_part.split("\n")[1].strip()
                correct_letter = correct_part.split(")")[0].strip()
                correct_index = ord(correct_letter) - ord('A')
                
                mcqs.append({
                    "question": question,
                    "options": options,
                    "correct": correct_index
                })
            except Exception as e:
                logger.error(f"Error parsing question: {e}")
    
    return mcqs

def generate_mcqs_with_google_search(topic: str, noq: int) -> List[Dict]:
    search_query = f"multiple choice questions on {topic} with answers"
    try:
        google_search_results = serper.run(search_query)
        logger.info(f"Google Search Results: {google_search_results}")
        
        mcqs = []
        if isinstance(google_search_results, dict):
            results = google_search_results.get('organic', [])
        elif isinstance(google_search_results, str):
            logger.warning("Google search results returned as string. Unable to parse.")
            return []
        else:
            logger.warning(f"Unexpected type for Google search results: {type(google_search_results)}")
            return []
        
        for result in results[:noq]:
            question = result.get('title', 'No question found')
            snippet = result.get('snippet', '')
            mcqs.append({
                "question": question,
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correct": 0
            })
        return mcqs
    except Exception as e:
        logger.error(f"Error in generate_mcqs_with_google_search: {e}")
        return []

def generate_report(score: int, total: int) -> str:
    report = f"\nYou answered {score} out of {total} questions correctly.\n"
    if score == total:
        report += "Excellent performance! 🌟 You're mastering this topic."
    elif score >= total // 2:
        report += "Good job! 👍 You have a good understanding but there is space for improvement."
    else:
        report += "It looks like you need more practice. Don't worry, you'll get there with more effort! 💪"
    return report

def generate_mcqs(topic: str, noq: int, level: str) -> List[Dict]:
    mcqs = generate_mcqs_with_llm(topic, noq, level)
    if not mcqs:
        logger.info("Falling back to Google Search for generating MCQs...")
        mcqs = generate_mcqs_with_google_search(topic, noq)
    
    if not mcqs:
        logger.error("Failed to generate MCQs using both LLM and Google Search.")
    
    return mcqs
