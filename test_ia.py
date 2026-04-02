import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv("backend/.env")
api_key = os.getenv("GEMINI_API_KEY")

print(f"Testing API Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key or api_key == "YOUR_GEMINI_API_KEY_HERE":
    print("Error: No API Key found in .env")
    exit(1)

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

try:
    response = model.generate_content("Responde con la palabra 'CONECTADO'.")
    print(f"Result: {response.text}")
except Exception as e:
    print(f"AI Error: {str(e)}")
