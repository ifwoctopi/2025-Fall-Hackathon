"""
Test script for the API endpoint.
Run this after starting the Flask server to test the API.
"""

import requests
import json

API_URL = "http://localhost:5000/api/simplify"

def test_simplify():
    """Test the simplify endpoint."""
    test_text = "How do I put in my insulin pump?"
    
    print(f"Testing API with: {test_text}")
    print("-" * 50)
    
    try:
        response = requests.post(
            API_URL,
            json={"text": test_text},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ Success!")
                print("\nSimplified Instructions:")
                print(data.get("result"))
            else:
                print("❌ Error:", data.get("error"))
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the Flask server is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_simplify()

