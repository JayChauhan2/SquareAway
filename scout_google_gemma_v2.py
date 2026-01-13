
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")

print("\n--- Listing Google GenAI Models (Filtering for 'gemma') ---")
url = "https://generativelanguage.googleapis.com/v1beta/openai/models"
headers = {
    "Authorization": f"Bearer {api_key}",
}

try:
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        found = False
        for m in data.get('data', []):
            if 'gemma' in m['id'].lower():
                print(f"ID: {m['id']} | Name: {m.get('display_name')}")
                found = True
        if not found:
            print("No models containing 'gemma' found via OpenAI endpoint.")
    else:
        print(f"Error fetching models: {response.status_code} - {response.text}")

except Exception as e:
    print(f"Error: {e}")
