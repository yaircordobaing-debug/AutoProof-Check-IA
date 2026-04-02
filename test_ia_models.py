import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv("backend/.env")
api_key = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=api_key)

try:
    print("Listing available models:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
    
    print("\nTesting gemini-flash-latest...")
    model = genai.GenerativeModel('gemini-flash-latest')
    response = model.generate_content("Responde: OK")
    print(f"Result: {response.text}")
except Exception as e:
    print(f"Error: {str(e)}")
