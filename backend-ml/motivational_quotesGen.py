import requests
import random
import json

# List of topics (categories) to choose from
topics = [
    "motivation",
    "success",
    "failure",
    "dreams",
    "education",

    "experience",
    "fear",


    "future",
    "happiness",
    "hope",
    "inspirational",
    "intelligence",
    "leadership",
    "learning",
]



category = random.choice(topics)


api_url = 'https://api.api-ninjas.com/v1/quotes?category={}'.format(category)


api_key = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'


response = requests.get(api_url, headers={'X-Api-Key': api_key})


if response.status_code == requests.codes.ok:
    
    quote_data = response.json()

    
    filtered_data = [{"quote": item["quote"], "author": item["author"]} for item in quote_data]

    # Printing the output in JSON format
    print(json.dumps(filtered_data, indent=4))

else:
    print("Error:", response.status_code, response.text) 
