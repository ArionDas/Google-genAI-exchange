from fastapi import FastAPI, HTTPException
import requests
from langchain import PromptTemplate, LLMChain
from langchain_community.llms import HuggingFaceHub
from bs4 import BeautifulSoup
import re
import os

# Initialize FastAPI app
app = FastAPI()

HUGGINGFACEHUB_API_TOKEN = os.getenv('HUGGINGFACEHUB_API_TOKEN')


# Initialize the HuggingFaceHub LLM with the API token
llm = HuggingFaceHub(
    repo_id="gpt2",
    model_kwargs={"temperature": 0.5, "max_length": 512},
    huggingfacehub_api_token=HUGGINGFACEHUB_API_TOKEN  # Add your Hugging Face API token here
)

# Define allowed DSA-related terms
ALLOWED_TERMS = [
    'linked list', 'stack', 'queue', 'sorting', 'heap', 'binary tree',
    'graph', 'searching', 'binary search', 'depth-first search',
    'breadth-first search', 'trie', 'hash table', 'dynamic programming'
]

# Define patterns to identify educational content
EDUCATIONAL_PATTERNS = [
    re.compile(r'\b(data\s+structure|algorithm|tutorial|course|introduction|overview|example)\b', re.IGNORECASE)
]

# Check if the content is educational
def is_educational(content):
    return any(pattern.search(content) for pattern in  EDUCATIONAL_PATTERNS)

# Wikipedia search function
def wikipedia_search(query, num_results=3):
    API_URL = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "format": "json",
        "srlimit": num_results
    }
    response = requests.get(API_URL, params=params)
    results = response.json()

    search_results = []
    if 'query' in results:
        for item in results['query']['search']:
            title = item['title']
            snippet = item.get('snippet', 'No snippet available')
            snippet_cleaned = BeautifulSoup(snippet, "html.parser").get_text()
            pageid = item['pageid']
            link = f"https://en.wikipedia.org/?curid={pageid}"
            if any(term in title.lower() for term in ALLOWED_TERMS) and is_educational(snippet_cleaned):
                search_results.append({
                    'title': title,
                    'link': link,
                    'snippet': snippet_cleaned
                })

    return search_results

# YouTube search function
def youtube_search(query, num_results=3):
    API_URL = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": num_results,
        "key": 'AIzaSyDHILp3O2gz_-ZfFZsXC_bxzElb9ZF1lnM'  # Replace with a valid YouTube API key
    }
    response = requests.get(API_URL, params=params)
    results = response.json()

    search_results = []
    if 'items' in results:
        for item in results['items']:
            title = item['snippet']['title']
            video_id = item['id']['videoId']
            link = f"https://www.youtube.com/watch?v={video_id}"
            description = item['snippet'].get('description', 'No description available')
            if any(term in title.lower() for term in ALLOWED_TERMS) and is_educational(description):
                search_results.append({
                    'title': title,
                    'link': link,
                    'description': description
                })

    return search_results

SERPAPI_KEY = os.getenv('SERPAPI_KEY')

# Web search function
def web_search(query, num_results=3):
    API_URL = "https://serpapi.com/search.json"
    params = {
        "q": query,
        "num": num_results,
        "api_key": SERPAPI_KEY  # Replace with a valid SerpAPI key
    }
    response = requests.get(API_URL, params=params)
    results = response.json()

    search_results = []
    if 'organic_results' in results:
        for item in results['organic_results']:
            title = item['title']
            link = item['link']
            snippet = item.get('snippet', 'No snippet available')
            if any(term in title.lower() for term in ALLOWED_TERMS) and is_educational(snippet):
                search_results.append({
                    'title': title,
                    'link': link,
                    'snippet': snippet
                })

    return search_results

# LangChain prompt template for summarizing search results
summary_template = """
Summarize the following search results related to {query}:

{results}

Provide a concise summary of the key points and most relevant information.
"""

summary_prompt = PromptTemplate(
    input_variables=["query", "results"],
    template=summary_template
)

# Create LLMChain for summarization
summary_chain = LLMChain(llm=llm, prompt=summary_prompt)

# Main search and summarize function
def search_and_summarize(query):
    wikipedia_results = wikipedia_search(query)
    youtube_results = youtube_search(query)
    web_results = web_search(query)

    combined_results = {
        'wikipedia': wikipedia_results,
        'youtube': youtube_results,
        'web': web_results
    }

    if not any(combined_results.values()):
        raise HTTPException(status_code=404, detail="No results found on any platform.")

    # Prepare results for summarization
    results_text = ""
    for platform, results in combined_results.items():
        results_text += f"\n{platform.capitalize()} Results:\n"
        for result in results:
            results_text += f"- {result['title']}\n  {result.get('snippet') or result.get('description')}\n"

    # Generate summary using LangChain
    summary = summary_chain.run(query=query, results=results_text)

    return {
        "results": combined_results,
        "summary": summary
    }



# To run the FastAPI server, use the following command:
# uvicorn myapp:app --reload
