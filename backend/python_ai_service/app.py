import os
import dotenv
from transformers import pipeline
from langchain_huggingface import HuggingFacePipeline

# Load environment variables
dotenv.load_dotenv()
api_key = os.getenv("HUGGINGFACE_API_KEY")

# Check if API key is available
if not api_key:
    raise ValueError("Hugging Face API key is missing. Please set it in your .env file.")

# Load Hugging Face Summarization Pipeline with API key
flanT5_pipeline = pipeline(
    "summarization",
    model="google/flan-t5-large",
    token=api_key  # Pass API key for authentication
)

llama3_pipeline = pipeline(
    "text-generation",
    model="meta-llama/Llama-3.1-8B-Instruct",
    token=api_key
)

# Wrap them inside LangChain
flanT5_llm = HuggingFacePipeline(pipeline=flanT5_pipeline)
llama3_llm = HuggingFacePipeline(pipeline=llama3_pipeline)


# Function to summarize study performance
def summarize_performance(studyData: str) -> str:
    try:
        prompt = f"Summarize the following study performance data: {studyData}"
        response = flanT5_llm.invoke(prompt)
        return response
    except Exception as error:
        print("Error summarizing study performance:", error)
        return "Failed to summarize study performance"

# Function to generate study materials
def generate_study_materials(topic: str) -> str:
    try:
        prompt = f"Generate study materials and flashcards for: {topic}"
        response = llama3_llm.invoke(prompt)
        return response
    except Exception as error:
        print("Error generating study materials:", error)
        return "Failed to generate study materials"