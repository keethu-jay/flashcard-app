import os
import sys
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from transformers import pipeline
import requests
from langchain_huggingface import HuggingFacePipeline

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

# Now import the routes
from python_ai_service.routes.flashcard_routes import flashcard_bp
from python_ai_service.routes.generation_routes import generation_bp
from python_ai_service.routes.auth_routes import auth_bp
from python_ai_service.db.database import create_users_table, add_user_id_to_sets

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-here')  # Add this for sessions
CORS(app, supports_credentials=True)

# Register blueprints
app.register_blueprint(flashcard_bp)
app.register_blueprint(generation_bp)
app.register_blueprint(auth_bp)

# Initialize database tables
create_users_table()
add_user_id_to_sets()

HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")

# def generate_flashcards_with_hf(prompt, model="gpt2"):
#     pipe = pipeline("text2text-generation", model=model)
#     result = pipe(prompt, max_length=512)
#     return result[0]['generated_text']

def generate_with_huggingface(prompt: str, model: str = "distilgpt2") -> str:
    huggingface_api_key = os.getenv("HUGGINGFACE_API_KEY")
    url = f"https://api-inference.huggingface.co/models/{model}"
    headers = {"Authorization": f"Bearer {huggingface_api_key}"}
    payload = {"inputs": prompt}
    response = requests.post(url, headers=headers, json=payload)
    print(f"HuggingFace API Response Status: {response.status_code}")
    print(f"HuggingFace API Response: {response.text[:200]}...")
    if response.status_code != 200:
        raise Exception(f"HuggingFace API error: {response.status_code} - {response.text}")
    result = response.json()
    if isinstance(result, list) and len(result) > 0:
        return result[0].get('generated_text', '')
    elif isinstance(result, dict):
        return result.get('generated_text', '')
    else:
        return str(result)

# Load Hugging Face Text Generation Pipeline with API key
llama3_pipeline = pipeline(
    "text-generation",
    model="tiiuae/falcon-rw-1b",
    token=HUGGINGFACE_API_KEY
)

# Wrap in LangChain
llama3_llm = HuggingFacePipeline(pipeline=llama3_pipeline)

# Function to generate study materials/flashcards
def generate_study_materials(topic: str) -> str:
    try:
        prompt = f"Generate study materials and flashcards for: {topic}"
        response = llama3_llm.invoke(prompt)
        return response
    except Exception as error:
        print("Error generating study materials:", error)
        return "Failed to generate study materials"

if __name__ == '__main__':
    print("Loading environment variables...")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Python path: {sys.path}")
    print(f"HUGGINGFACE_API_KEY exists: {bool(os.getenv('HUGGINGFACE_API_KEY'))}")
    print(f"DB_HOST exists: {bool(os.getenv('DB_HOST'))}")
    print(f"DB_NAME exists: {bool(os.getenv('DB_NAME'))}")
    print(f"DB_USER exists: {bool(os.getenv('DB_USER'))}")
    print(f"DB_PASSWORD exists: {bool(os.getenv('DB_PASSWORD'))}")
    app.run(debug=True)