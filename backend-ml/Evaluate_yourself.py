

from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain.agents import initialize_agent, Tool
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain_groq import ChatGroq
from langchain_community.utilities import GoogleSerperAPIWrapper
import random


mcq_system1 = """
You are a highly knowledgeable AI that generates multiple-choice questions (MCQs) on topics related to Data Structures and Algorithms (DSA) like stack , queue and so on.
Generate 5 MCQs on the given topic to assess the student's understanding. Out of these 5 questions, keep two question of difficult,
one question of moderate level and the rest on   Each MCQ should have:
1. A clear question.
2. Four answer choices.
3. The correct answer marked with 'Correct:' before the option.This should be done at the end after mentioning all the the options of the question. for eg:
Here are 5 MCQs on the topic of Stacks:\n\n**MCQ 1**\nWhat is the primary operation that adds an element
to a stack?\n\nA) Pop\nB) Push\nC) Peek\nD) Traverse\nCorrect: B) Push\n\n**MCQ 2**\nWhich of the following is a
 characteristic of a stack data structure?\n\nA) Elements can be accessed in any order\nB) Elements are stored
  in a specific order\nC) Elements are accessed in a random order\nD) Elements are accessed in a Last-In-First-Out
   (LIFO) order\nCorrect: D) Elements are accessed in a Last-In-First-Out (LIFO) order\n\n**MCQ 3**\nWhat is the purpose
    of the "top" pointer in a stack implementation?\n\nA) To point to the bottom of the stack\nB) To point to the middle of the
    stack\nC) To point to the current top element of the stack\nD) To point to the next available memory location\nCorrect: C) To
     point to the current top element of the stack\n\n**MCQ 4**\nWhich of the following operations is not typically supported by
     a stack data structure?\n\nA) Insert\nB) Delete\nC) Search\nD) Peek\nCorrect: C) Search\n\n**MCQ 5**\nWhat is the time complexity
      of the push operation in a stack implemented using an array?\n\nA) O(1)\nB) O(n)\nC) O(log n)\nD) O(n^2)\nCorrect: A) O(1)
Ensure that the questions cover different areas of the topic.
"""



def parse_mcqs_from_response_func(response):
    mcqs = []

    # Split the response by "**MCQ" to separate each question (based on the current format of LLM response)
    questions = response.split("**MCQ")
    print(f'questions: {questions}')
    for q in questions[1:]:  # Skip the first split part (non-question text)
        if "Correct:" in q:
            # Separate the question and correct part
            try:
                question_part, correct_part = q.split("Correct:")
                print(f'question_part: {question_part}')
                print(f'correct_part: {correct_part}')
            except ValueError:
                print(f"Error splitting question and correct part: {q}")
                continue

            try:
                # Separate the question text from the options
                lines = question_part.split("\n")
                optionss = [line for line in lines if line.strip()[:2] in ['A)', 'B)', 'C)', 'D)']]
                options = [option.split(") ")[1].strip() for option in optionss]
                print(f'options: {options}')
                # Extract the question (ignore empty lines)
                question = question_part.split("\n")[1]
                print(f'question: {question}')
                # Extract answer choices (only non-empty lines)
                answers = options
                print(f'answers: {answers}')
                # Get the correct answer index (e.g., "B) O(n + m)" -> "B")
                correct_letter = correct_part.split(")")[0].strip()
                correct_index = ord(correct_letter) - ord('A')  # Convert A/B/C/D to index
                print(f'correct_index: {correct_index}')
                # Append the parsed question and options to the MCQ list
                mcqs.append({
                    "question": question,
                    "options": answers,
                    "correct": correct_index
                })
            except Exception as e:
                print(f"Error parsing question: {e}")


    return mcqs

def quiz(mcqs):
    if not mcqs:
        print("No MCQs generated. Please try again with a different topic.")
        return 0

    score = 0
    for i, mcq in enumerate(mcqs, 1):
        # Display the question and options
        print(f"Q{i}: {mcq['question']}")
        for j, option in enumerate(mcq['options']):
            print(f"   {j+1}. {option}")

        # Prompt the user for an answer immediately after each question is displayed
        answer = input("Your answer (1/2/3/4): ")

        # Check if the answer is correct
        if int(answer) - 1 == mcq['correct']:
            print("Correct! ✅")
            score += 1
        else:
            print(f"Wrong! ❌ The correct answer is {mcq['correct']+1}. {mcq['options'][mcq['correct']]}")

        # Add an extra line for better readability

    return score



# Initialize ChatGroq model with the correct API key and parameters
chat = ChatGroq(temperature=0.5, groq_api_key=userdata.get('GROQ_API_KEY'), model_name="llama3-70b-8192")

# Initialize the Google search tool (using Serper API)
serper = GoogleSerperAPIWrapper(serper_api_key=userdata.get('SERPER_API_KEY'))

# Define system and human prompts for MCQ generation
mcq_system = """
You are a highly knowledgeable AI that generates multiple-choice questions (MCQs) on topics related to Data Structures and Algorithms (DSA) like stack , queue and so on.
Generate 5 MCQs on the given topic to assess the student's understanding. Out of these 5 questions, keep two question of difficult, one question of moderate level and the rest on   Each MCQ should have:
1. A clear question.
2. Four answer choices.
3. The correct answer marked with 'Correct:' before the option.This should be done at the end after mentioning all the the options of the question. for eg:
Here are 5 MCQs on the topic of Stacks:\n\n**MCQ 1**\nWhat is the primary operation that adds an element to a stack?\n\nA) Pop\nB) Push\nC) Peek\nD) Traverse\nCorrect: B) Push\n\n**MCQ 2**\nWhich of the following is a characteristic of a stack data structure?\n\nA) Elements can be accessed in any order\nB) Elements are stored in a specific order\nC) Elements are accessed in a random order\nD) Elements are accessed in a Last-In-First-Out (LIFO) order\nCorrect: D) Elements are accessed in a Last-In-First-Out (LIFO) order\n\n**MCQ 3**\nWhat is the purpose of the "top" pointer in a stack implementation?\n\nA) To point to the bottom of the stack\nB) To point to the middle of the stack\nC) To point to the current top element of the stack\nD) To point to the next available memory location\nCorrect: C) To point to the current top element of the stack\n\n**MCQ 4**\nWhich of the following operations is not typically supported by a stack data structure?\n\nA) Insert\nB) Delete\nC) Search\nD) Peek\nCorrect: C) Search\n\n**MCQ 5**\nWhat is the time complexity of the push operation in a stack implemented using an array?\n\nA) O(1)\nB) O(n)\nC) O(log n)\nD) O(n^2)\nCorrect: A) O(1)
Ensure that the questions cover different areas of the topic.
"""

# Function to generate dynamic MCQs using LLM
def generate_mcqs_with_llm(topic):
    human = f"Generate 5 MCQs on the topic: {topic}"

    # Create prompt with the request for MCQs
    prompt = ChatPromptTemplate.from_messages([("system", mcq_system), ("human", human)])

    # Create a chain using the prompt and the model
    chain = LLMChain(prompt=prompt, llm=chat)

    # Run the chain to generate MCQs
    response = chain.run({"topic": topic})

    # Print the response from the LLM for debugging
    #print(f"LLM Response: {response}")

    # Parse the response and handle potential parsing errors
    try:
        mcqs = parse_mcqs_from_response(response)
        if not mcqs:
            raise ValueError("No MCQs parsed from the LLM response.")

        return mcqs
    except Exception as e:
        print(f"Error parsing LLM response: {e}")
        return []

# Function to parse MCQs from LLM response
def parse_mcqs_from_response(response):
    mcqs = []

    # Split the response by "**MCQ" to separate each question (based on the current format of LLM response)
    questions = response.split("**MCQ")
    #print(f'questions: {questions}')
    for q in questions[1:]:  # Skip the first split part (non-question text)
        if "Correct:" in q:
            # Separate the question and correct part
            try:
                question_part, correct_part = q.split("Correct:")
                #print(f'question_part: {question_part}')
                #print(f'correct_part: {correct_part}')
            except ValueError:
                #print(f"Error splitting question and correct part: {q}")
                continue

            try:
                # Separate the question text from the options
                lines = question_part.split("\n")
                optionss = [line for line in lines if line.strip()[:2] in ['A)', 'B)', 'C)', 'D)']]
                options = [option.split(") ")[1].strip() for option in optionss]
                #print(f'options: {options}')
                # Extract the question (ignore empty lines)
                question = question_part.split("\n")[1]
                #print(f'question: {question}')
                # Extract answer choices (only non-empty lines)
                answers = options
                #print(f'answers: {answers}')
                # Get the correct answer index (e.g., "B) O(n + m)" -> "B")
                correct_letter = correct_part.split(")")[0].strip()
                correct_index = ord(correct_letter) - ord('A')  # Convert A/B/C/D to index
                #print(f'correct_index: {correct_index}')
                # Append the parsed question and options to the MCQ list
                mcqs.append({
                    "question": question,
                    "options": answers,
                    "correct": correct_index
                })
            except Exception as e:
                print(f"Error parsing question: {e}")


    return mcqs

# Function to use Google Search to find MCQs as a fallback
def generate_mcqs_with_google_search(topic):
    search_query = f"multiple choice questions on {topic} with answers"

    # Use Google Search to find questions
    google_search_results = serper.run(search_query)

    # Print the search results to inspect the structure
    print("Google Search Results:", google_search_results)

    # Check if the results are in JSON format or string, and parse accordingly
    mcqs = []
    try:
        results = google_search_results.get('results', [])

        for result in results[:5]:  # Taking top 5 search results
            # Simplified assumption for MCQs from search results
            question = result.get('title', 'No question found')
            snippet = result.get('snippet', '')
            mcqs.append({
                "question": question,
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],  # This can be improved based on snippet parsing
                "correct": 0  # Assume first option is correct for simplicity
            })

    except AttributeError:
        print("Error: Google search results are not in the expected format.")

    return mcqs

# Function to quiz the student on the generated MCQs and evaluate their score
def quiz_student(mcqs):
    if not mcqs:
        print("No MCQs generated. Please try again with a different topic.")
        return 0

    score = 0
    for i, mcq in enumerate(mcqs, 1):
        # Display the question and options
        print(f"Q{i}: {mcq['question']}")
        for j, option in enumerate(mcq['options']):
            print(f"   {j+1}. {option}")

        # Prompt the user for an answer immediately after each question is displayed
        answer = input("Your answer (1/2/3/4): ")

        # Check if the answer is correct
        if int(answer) - 1 == mcq['correct']:
            print("Correct! ✅")
            score += 1
        else:
            print(f"Wrong! ❌ The correct answer is {mcq['correct']+1}. {mcq['options'][mcq['correct']]}")

        # Add an extra line for better readability

    return score

# Function to generate a detailed report based on student's score
def generate_report(score):
    report = f"\nYou answered {score} out of 5 questions correctly.\n"
    if score == 5:
        report += "Excellent performance! 🌟 You're mastering this topic."
    elif score >= 3:
        report += "Good job! 👍 You have a good understanding but can improve."
    else:
        report += "It looks like you need more practice. Don't worry, you'll get there with more effort! 💪"
    return report

# Function to start the MCQ test bot with both LLM and Google Search fallback
def run_mcq_bot():
    print("MCQ Bot: Hello! Let's test your knowledge with a short quiz on Data Structures and Algorithms (DSA).")

    # Prompt the user for the topic
    topic = input("Enter a DSA topic to generate MCQs (e.g., sorting algorithms, graphs, dynamic programming): ")

    # Try to generate dynamic MCQs using LLM
    mcqs = generate_mcqs_with_llm(topic)

    if len(mcqs) == 0:
        print("Falling back to Google Search for generating MCQs...")
        mcqs = generate_mcqs_with_google_search(topic)

    # Quiz student on MCQs one by one
    score = quiz_student(mcqs)

    # Generate and display the report
    report = generate_report(score)
    print(report)

# Start the MCQ Bot
# run_mcq_bot()

