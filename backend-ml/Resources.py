from fastapi import FastAPI, HTTPException
import requests
import json
import os
app = FastAPI()

YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')


# YouTube search function (using the YouTube Data API with API key)
def youtube_searchs(query: str, num_results: int = 5) -> list:
    API_URL = "https://www.googleapis.com/youtube/v3/search"
    API_KEY = YOUTUBE_API_KEY  # Your API key
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": num_results,
        "key": API_KEY
    }

    try:
        response = requests.get(API_URL, params=params)
        response.raise_for_status()
        results = response.json()

        youtube_results = []
        if 'items' in results:
            for item in results['items']:
                title = item['snippet']['title']
                video_id = item['id']['videoId']
                link = f"https://www.youtube.com/watch?v={video_id}"
                description = item['snippet'].get('description', 'No description available')

                youtube_results.append({
                    'title': title,
                    'link': link,
                    'description': description
                })

        return youtube_results
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return []


# GeeksForGeeks search function
def geeks_for_geeks_search(query, api_key):
    API_URL = "https://serpapi.com/search.json"
    params = {
        "q": f"site:geeksforgeeks.org {query}",
        "num": 3,
        "api_key": api_key
    }

    try:
        response = requests.get(API_URL, params=params)
        response.raise_for_status()
        results = response.json()

        search_results = []
        for item in results['organic_results']:
            title = item['title']
            link = item['link']
            snippet = item.get('snippet', 'No snippet available')
            search_results.append({
                'title': title,
                'link': link,
                'snippet': snippet
            })

        return search_results
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return []


MEDIUM_API_KEY = os.getenv('MEDIUM_API_KEY')

# Medium search function
def medium_search(query):
    API_URL = "https://serpapi.com/search.json"
    params = {
        "q": f"site:medium.com {query}",
        "num": 3,
        "api_key": MEDIUM_API_KEY
    }

    try:
        response = requests.get(API_URL, params=params)
        response.raise_for_status()
        results = response.json()

        search_results = []
        for item in results.get('organic_results', []):
            title = item['title']
            link = item['link']
            snippet = item.get('snippet', 'No snippet available')
            search_results.append({
                'title': title,
                'link': link,
                'snippet': snippet
            })

        return search_results
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return []

GEEKSFORGEEKS_API_KEY = os.getenv('GEEKSFORGEEKS_API_KEY')

# Combined search function
def searchResources(query):
    medium_results = medium_search(query)
    youtube_results = youtube_searchs(query)
    
    # Ask the user to enter the API key
    api_key = GEEKSFORGEEKS_API_KEY
    geeksforgeeks_results = geeks_for_geeks_search(query, api_key)

    combined_results = {
        'medium': medium_results,
        'youtube': youtube_results,
        'geeksforgeeks': geeksforgeeks_results
    }

    if not any(combined_results.values()):
        return {"message": "No results found on any platform."}

    final_results = {
        "results": {
            "medium": {
                "title": medium_results[0]['title'] if medium_results else "No Medium results",
                "link": medium_results[0]['link'] if medium_results else ""
            },
            "youtube": {
                "title": youtube_results[0]['title'] if youtube_results else "No YouTube results",
                "link": youtube_results[0]['link'] if youtube_results else ""
            },
            "geeksforgeeks": {
                "title": geeksforgeeks_results[0]['title'] if geeksforgeeks_results else "No GeeksforGeeks results",
                "link": geeksforgeeks_results[0]['link'] if geeksforgeeks_results else ""
            }
        }
    }

    return final_results





# To run the FastAPI app, use the following command:
# uvicorn your_script_name:app --reload
