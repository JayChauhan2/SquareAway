
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

print("\n--- Listing Models via Groq API ---")
url = "https://api.groq.com/openai/v1/models"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

try:
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        models = response.json().get('data', [])
        for m in models:
            if 'gemma' in m['id']:
                print(f"FOUND GEMMA: {m['id']}")
            else:
                print(f"Other: {m['id']}")
    else:
        print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
