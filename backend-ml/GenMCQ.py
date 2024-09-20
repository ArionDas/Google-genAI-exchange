from langchain.agents import initialize_agent, Tool
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain_groq import ChatGroq
from langchain_community.utilities import GoogleSerperAPIWrapper
from typing import List, Dict
from dotenv import load_dotenv
import os

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
    response = chain.run({"topic": topic, "noq": noq, "level": level})
    
    try:
        mcqs = parse_mcqs_from_response(response)
        if not mcqs:
            raise ValueError("No MCQs parsed from the LLM response.")
        return mcqs
    except Exception as e:
        print(f"Error parsing LLM response: {e}")
        return []

def parse_mcqs_from_response(response: str) -> List[Dict]:
    mcqs = []
    questions = response.split("**MCQ")
    
    for q in questions[1:]:
        if "Correct:" in q:
            try:
                question_part, correct_part = q.split("Correct:")
                lines = question_part.split("\n")
                optionss = [line for line in lines if line.strip()[:2] in ['A)', 'B)', 'C)', 'D)']]
                options = [option.split(") ")[1].strip() for option in optionss]
                question = question_part.split("\n")[1]
                answers = options
                correct_letter = correct_part.split(")")[0].strip()
                correct_index = ord(correct_letter) - ord('A')
                
                mcqs.append({
                    "question": question,
                    "options": answers,
                    "correct": correct_index
                })
            except Exception as e:
                print(f"Error parsing question: {e}")
    
    return mcqs

def generate_mcqs_with_google_search(topic: str, noq: int) -> List[Dict]:
    search_query = f"multiple choice questions on {topic} with answers"
    google_search_results = serper.run(search_query)
    
    mcqs = []
    try:
        results = google_search_results.get('results', [])
        for result in results[:noq]:
            question = result.get('title', 'No question found')
            snippet = result.get('snippet', '')
            mcqs.append({
                "question": question,
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correct": 0
            })
    except AttributeError:
        print("Error: Google search results are not in the expected format.")
    
    return mcqs

def generate_report(score: int, total: int) -> str:
    report = f"\nYou answered {score} out of {total} questions correctly.\n"
    if score == total:
        report += "Excellent performance! 🌟 You're mastering this topic."
    elif score >= total // 2:
        report += "Good job! 👍 You have a good understanding but there is space for improvement."
    else:
        report += "It looks like you need more practice. Don't worry, you'll get there with more effort! 💪"
    return report
