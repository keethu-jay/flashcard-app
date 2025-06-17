import os
import sys
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from transformers import pipeline
import requests

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

# Now import the routes
from python_ai_service.routes.flashcard_routes import flashcard_bp
from python_ai_service.routes.generation_routes import generation_bp

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(flashcard_bp)
app.register_blueprint(generation_bp)

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

def generate_flashcards_with_hf(prompt, model="google/flan-t5-base"):
    pipe = pipeline("text2text-generation", model=model)
    result = pipe(prompt, max_length=512)
    return result[0]['generated_text']

def generate_with_huggingface(prompt, model="google/flan-t5-base"):
    url = f"https://api-inference.huggingface.co/models/{model}"
    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}
    response = requests.post(url, headers=headers, json={"inputs": prompt})
    return response.json()

if __name__ == '__main__':
    print("Loading environment variables...")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Python path: {sys.path}")
    print(f"OPENAI_API_KEY exists: {bool(os.getenv('OPENAI_API_KEY'))}")
    print(f"DB_HOST exists: {bool(os.getenv('DB_HOST'))}")
    print(f"DB_NAME exists: {bool(os.getenv('DB_NAME'))}")
    print(f"DB_USER exists: {bool(os.getenv('DB_USER'))}")
    print(f"DB_PASSWORD exists: {bool(os.getenv('DB_PASSWORD'))}")
    app.run(debug=True)