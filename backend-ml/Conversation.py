
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain_community.tools import YouTubeSearchTool
from langchain.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from langchain.agents import initialize_agent, Tool
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain_groq import ChatGroq
from langchain_community.utilities import GoogleSerperAPIWrapper
import time


youtube = YouTubeSearchTool()

wikipedia = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper())




# Initialize ChatGroq model with the correct API key and parameters
chat = ChatGroq(temperature=0.5, groq_api_key = userdata.get('GROQ_API_KEY'), model_name="llama3-70b-8192")

# Initialize the Google search tool (using Serper API)
serper = GoogleSerperAPIWrapper(serper_api_key = userdata.get('SERPER_API_KEY'))

# Define system and human prompts for the model
system = "You are a helpful assistant."
human = "{text}"

# Create the prompt template
prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

# Create a chain using the prompt and the model
chain = LLMChain(prompt=prompt, llm=chat)

# Define the toolset
tools = [
    Tool(
        name="Google Search",
        func=serper.run,
        description="Useful for searching the web when the user asks for real time scenarios/data or particular individuals  ."
    ),
    Tool(
       name="Youtube Search",
       func=youtube.run,
       description="Useful for when the user explicitly asks you to look on Youtube or asks about any particular individual.",
   ),
     Tool(
       name="Wikipedia Search",
       func=wikipedia.run,
       description="Useful when users request historical moments or phenomenons or events .",
   )
]

# Filter precise output from the response
def precise_output(response, query):
   prompt2 = ChatPromptTemplate.from_template("""
    You need to filter the response provided by the model and strictly give only the most precise and informative part of the model's response according to the user's interest shown in user's query. You have
    to just produce output directly without any other explanation like 'this is the final output,' etc.You may frame answer into meaningful sentence  in less than 500 words.
    User Query: {query}
    Model Response: {response}
    """)
   # Use a chain for refining output
   chain = LLMChain(prompt=prompt2, llm=chat)
   return chain.run({"query": query, "response": response})

# Define the agent
def initialize_custom_agent():
    """
    Initializes the agent with both the language model and external tools (Google Search in this case).
    The agent decides when to use the LLM and when to query external resources.
    """
    # Initialize the agent with the available tools
    agent = initialize_agent(
        tools=tools,
        llm=chat,
        agent_type="chat-conversational-react",  # Type of agent that can have conversations and react to user input
        verbose=False,
        handle_parsing_errors=True# This will show reasoning steps taken by the agent
    )
    return agent

# Query the agent and get the best response (either from LLM or web search)
def query_agent(query):
    # Initialize the agent
    agent = initialize_custom_agent()

    # Run the agent on the user's query
    response = agent.run(query)

    # Return the agent's response
    return response

# Query the system with an example query
query = "What is attention mechanism in transformer. suggest some youtube videos on it.?"

# Run the agent
#response = query_agent(query)





# Initialize ChatGroq model with the correct API key and parameters
chat = ChatGroq(temperature=0.5, groq_api_key="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", model_name="llama3-70b-8192")

# Initialize the Google search tool (using Serper API)
serper = GoogleSerperAPIWrapper(serper_api_key='c05239543e7aa4ea3e8d1eaf0e92e97be72a16a1')
wikipedia = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper())
youtube = YouTubeSearchTool()




# Define system and human prompts for the model
system = """
You are a highly effective AI teaching assistant that uses the Socratic method to guide students toward understanding concepts in Data Structures and Algorithms (DSA).
Your role is  to ask thoughtful, probing questions that lead the student to figure out the solution on their own.

If the student's answer seems almost correct or he/she is very desperate for the solution, then you should provide the correct answer without asking any further question.

The focus of the current topic is on **Data Structures and Algorithms (DSA)**, and your questions should guide the student to:
1. Understand various data structures such as arrays, linked lists, stacks, queues, trees, heaps, and graphs, as well as algorithms like sorting, searching, dynamic programming, and graph traversal.
2. Identify where their code or understanding might be lacking, whether it’s related to implementation, time complexity, or space complexity.
3. Optimize and debug their solutions effectively, ensuring the correct application of algorithmic principles, edge case handling, and performance improvements.

For example, when a student asks why their code is failing, you might ask:
- "What edge cases could cause this issue in your implementation?"
- "How does the time complexity of your solution compare with other algorithms for the same problem?"
- "Have you thought about using a different data structure to improve the efficiency of your algorithm?"



Your task is to guide students through inquiry and reflection, keeping in mind the previous conversations. Keep the student engaged with meaningful questions to help them arrive at the correct answer independently. You may also
encourage students by appraising them like "well done","excellent" or some emojis or giving them hope that they are very close to
answer if user stucks at a particular point.
If the student's answer seems almost correct or he/she is very desperate for the solution, then you should provide the correct answer without asking any further question.
"""

# Function to create a conversation history
def format_conversation_history(history):
    return "\n".join([f"Student: {entry['student']}\nSocratic Assistant: {entry['assistant']}" for entry in history])

# Function to generate a Socratic response considering the conversation history
def socratic_conversation(student_query, history):
    # Add history to the new query
    history_text = format_conversation_history(history)
    human = f"""
    {history_text}

    Student: {student_query}

    Respond to the student's query by asking a probing question that leads them to the solution.
    """

    # Create prompt with history
    prompt = ChatPromptTemplate.from_messages([("system", system), ("human", human)])

    # Create a chain using the updated prompt and the model
    chain = LLMChain(prompt=prompt, llm=chat)

    return chain.run({"student_query": student_query})

# Define the toolset with Google, YouTube, and Wikipedia search
tools = [
    Tool(
        name="Google Search",
        func=serper.run,
        description="Useful for searching the web when the user asks for real time scenarios/data or particular individuals."
    ),
    Tool(
        name="YouTube Search",
        func=youtube.run,
        description="Useful for when the user explicitly asks you to look on YouTube or asks about any particular individual."
    ),
    Tool(
        name="Wikipedia Search",
        func=wikipedia.run,
        description="Useful when users request historical moments or information on specific phenomena or events."
    )
]

# Initialize the agent with the available tools
def initialize_custom_agent():
    """
    Initializes the agent with both the language model and external tools (Google, YouTube, Wikipedia Search).
    The agent decides when to use the LLM and when to query external resources.
    """
    agent = initialize_agent(
        tools=tools,
        llm=chat,
        agent_type="chat-conversational-react",
        verbose=False,
        handle_parsing_errors=True
    )
    return agent

# Function to query the agent and get the best response, considering the history
def query_agent(query, history):
    # Initialize the agent
    agent = initialize_custom_agent()

    # Get the Socratic response based on history
    response = socratic_conversation(query, history)

    # Update the history with the student's query and the assistant's response
    history.append({"student": query, "assistant": response})

    # Return the updated response and history
    return response, history

# Chatbot loop with conversation history: continue until the student types 'exit'
def run_socratic_bot():
    history = []  # To store conversation history
    print("Socratic Assistant: Hello! I'm here to help you with DSA using the Socratic method. Type 'exit' to end the conversation.")

    while True:
        # Get the student's input
        student_query = input("Student: ")

        # Exit condition
        if student_query.lower() == 'exit':
            print("Socratic Assistant: Goodbye!")
            break

        # Process the query through the agent, considering the history
        assistant_response, history = query_agent(student_query, history)

        # Display the assistant's response
        print(f"Socratic Assistant: {assistant_response}")

# Start the Socratic Bot
#run_socratic_bot()

