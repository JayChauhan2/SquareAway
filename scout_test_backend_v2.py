
import requests
import json

url = "http://127.0.0.1:5000/create-questions"
data = {
    "topic": "Math",
    "count": 1,
    "types": ["multiple-choice"]
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=data, timeout=30)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:1000]}") 
except Exception as e:
    print(f"Error: {e}")
