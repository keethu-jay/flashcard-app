import os
import dotenv
from transformers import pipeline, AutoTokenizer # AutoTokenizer will be needed for Phi-3
from langchain_huggingface import HuggingFacePipeline
import json
from typing import Optional
import psycopg2
from psycopg2 import sql
from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import re

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app)

# Load environment variables
dotenv.load_dotenv()
api_key = os.getenv("HUGGINGFACE_API_KEY")

if not api_key:
    raise ValueError("Hugging Face API key is missing. Please set it in your .env file.")

# --- Database Connection Function ---
def get_db_connection():
    try:
        conn = psycopg2.connect(
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT")
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

# --- Hugging Face Pipeline Initialization ---

# Pipeline for summarization (can keep Flan-T5-Small or Base if needed for other tasks)
# For simplicity, if you only need generation, you could remove this pipeline.
flan_t5_summarization_model_name = "google/flan-t5-small"
flanT5_summarization_pipeline = pipeline(
    "summarization",
    model=flan_t5_summarization_model_name,
    token=api_key
)
flanT5_summarization_llm = HuggingFacePipeline(pipeline=flanT5_summarization_pipeline)


# --- NEW GENERATION MODEL: microsoft/Phi-3-mini-4k-instruct ---
phi3_model_name = "microsoft/Phi-3-mini-4k-instruct"
# Phi-3 is a decoder-only model, so its tokenizer setup is similar to Llama/TinyLlama
phi3_tokenizer = AutoTokenizer.from_pretrained(phi3_model_name, token=api_key)

phi3_generation_pipeline = pipeline(
    "text-generation", # Use text-generation task for Phi-3
    model=phi3_model_name,
    token=api_key,
    max_new_tokens=1500,
    do_sample=True,
    temperature=0.7,
    top_k=50,
    top_p=0.95,
    # Phi-3 typically handles padding well, but setting eos_token_id is good.
    # pad_token_id=phi3_tokenizer.pad_token_id if phi3_tokenizer.pad_token_id is not None else phi3_tokenizer.eos_token_id,
    eos_token_id=phi3_tokenizer.eos_token_id,
    return_full_text=False # Crucial to prevent prompt echoing
)
phi3_llm = HuggingFacePipeline(pipeline=phi3_generation_pipeline) # This will be your primary LLM for generation


# --- AI Function Definitions ---
def summarize_performance(studyData: str) -> str:
    # Use the specific summarization pipeline if you have one
    try:
        prompt = f"Summarize the following study performance data: {studyData}"
        response = flanT5_summarization_llm.invoke(prompt) # Using Flan-T5-Small for summarization
        return response
    except Exception as error:
        print("Error summarizing study performance:", error)
        return "Failed to summarize study performance"

def generate_study_materials(
        topic: str,
        test_name: Optional[str] = None,
        intensity_level: str = "general learning"
) -> list[dict]:
    try:
        prompt_parts = []
        prompt_parts.append(f"Generate a list of flashcards for the topic: '{topic}'.")

        if test_name:
            prompt_parts.append(f"Focus on concepts highly relevant to the '{test_name}' exam.")

        num_cards = 0
        depth_description = ""
        true_false_ratio = ""

        intensity_level_lower = intensity_level.lower()

        if "casual learning" in intensity_level_lower:
            num_cards = 5
            depth_description = "Keep definitions concise and explanations brief."
            true_false_ratio = "Include 1-2 true/false questions and the rest as definitions."
        elif "personal education" in intensity_level_lower:
            num_cards = 10
            depth_description = "Focus on exploring key concepts and their applications for personal understanding. Provide clear explanations and diverse question types."
            true_false_ratio = "Include a balanced mix of definition and true/false questions (e.g., 3-4 true/false)."
        elif "comprehensive test prep" in intensity_level_lower:
            num_cards = 15
            depth_description = "Offer comprehensive and detailed definitions with thorough explanations and challenging questions. Prioritize deep understanding for exam readiness."
            true_false_ratio = "Include 5-7 true/false questions with nuanced statements and the rest as detailed definitions."
        else:
            num_cards = 8
            depth_description = "Provide standard definitions and explanations."
            true_false_ratio = "Include 2-3 true/false questions and the rest as definitions."

        prompt_parts.append(f"Generate exactly {num_cards} flashcards.")
        prompt_parts.append(depth_description)
        prompt_parts.append(true_false_ratio)

        # === CRITICAL PROMPT INSTRUCTIONS FOR JSON OUTPUT ===
        prompt_parts.append("Your output MUST be a JSON array of objects. Each object should have two keys: 'front' (for the question/term) and 'back' (for the answer/definition).")
        prompt_parts.append("DO NOT include any introductory or concluding text. Respond ONLY with the JSON array.")
        prompt_parts.append("Strictly follow this JSON structure and provide real content:")
        prompt_parts.append("Example: [{\"front\": \"Your actual question here\", \"back\": \"Your actual answer here\"}, {\"front\": \"True or False: Statement\", \"back\": \"True/False\"}]")

        full_prompt_content = " ".join(prompt_parts)

        # === FORMAT PROMPT FOR PHI-3-MINI-4K-INSTRUCT'S TEMPLATE ===
        # Phi-3-mini-4k-instruct uses the ChatML format.
        # This is very important for it to follow instructions.
        messages = [
            {"role": "user", "content": full_prompt_content},
            {"role": "assistant", "content": ""} # Assistant starts the JSON response
        ]
        # Apply the chat template using the tokenizer
        # The `skip_special_tokens=True` is often used when creating prompt strings for models,
        # but here we want the exact format string for generation.
        # Using `apply_chat_template` is the most robust way.
        formatted_prompt = phi3_tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)


        print(f"--- Sending Prompt to LLM ---\n{formatted_prompt}\n-----------------------------")

        # Step 3: Invoke the LLM with the formatted prompt (using phi3_llm)
        raw_response = phi3_llm.invoke(formatted_prompt)
        print(f"--- Raw LLM Response ---\n{raw_response}\n--------------------------")

        # --- JSON Parsing Logic (REUSED - should be robust) ---
        flashcards = []
        json_string_to_parse = ""

        try:
            cleaned_raw_response = raw_response.replace('```json', '').replace('```', '').strip()
            json_string_to_parse = cleaned_raw_response
            flashcards = json.loads(json_string_to_parse)

        except json.JSONDecodeError as direct_decode_error:
            print(f"Direct JSON decode failed: {direct_decode_error}. Attempting regex extraction and cleaning.")

            cleaned_for_regex = raw_response.replace('\n', ' ').replace('\r', '').replace("'", '"').strip()
            cleaned_for_regex = re.sub(r'\s+', ' ', cleaned_for_regex)

            pattern = r'"front"\s*:\s*"(?P<front_content>(?:[^"\\]|\\.)*?)"\s*,\s*"back"\s*:\s*"(?P<back_content>(?:[^"\\]|\\.)*?)"'
            matches = re.findall(pattern, cleaned_for_regex)

            reconstructed_flashcards_list = []
            for match_tuple in matches:
                reconstructed_flashcards_list.append({
                    "front": match_tuple[0].strip(),
                    "back": match_tuple[1].strip()
                })

            json_string_to_parse = json.dumps(reconstructed_flashcards_list, ensure_ascii=False)
            flashcards = json.loads(json_string_to_parse)

        # Basic validation
        if not isinstance(flashcards, list):
            raise ValueError("LLM did not return a JSON array after parsing.")
        for card in flashcards:
            if not isinstance(card, dict) or 'front' not in card or card.get('front') is None or 'back' not in card or card.get('back') is None:
                raise ValueError("Each flashcard in the JSON array must be an object with 'front' and 'back' keys, and their values must not be None.")

        # --- Database Storage ---
        conn = get_db_connection()
        if conn:
            try:
                cur = conn.cursor()
                current_set_id = str(uuid.uuid4())

                for card in flashcards:
                    cur.execute(
                        sql.SQL("INSERT INTO flashcards (set_id, topic, test_name, intensity_level, front_text, back_text) VALUES (%s, %s, %s, %s, %s, %s)"),
                        [current_set_id, topic, test_name, intensity_level, card.get('front'), card.get('back')]
                    )
                conn.commit()
                print(f"Successfully stored {len(flashcards)} flashcards for topic '{topic}' with set_id '{current_set_id}' in the database.")
            except Exception as db_error:
                conn.rollback()
                print(f"Database error during flashcard storage: {db_error}")
            finally:
                cur.close()
                conn.close()
        return flashcards

    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from LLM response: {e}")
        print(f"Faulty JSON string might be (first 500 chars): {json_string_to_parse[:500]}...")
        return []
    except ValueError as e:
        print(f"Error processing LLM response: {e}")
        return []
    except Exception as error:
        print("Error generating study materials:", error)
        return []

# --- Flask Routes ---

@app.route('/generate_flashcards', methods=['POST'])
def api_generate_flashcards():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    topic = data.get('topic')
    test_name = data.get('test')
    intensity_level = data.get('depth')

    if not topic or not intensity_level:
        return jsonify({"error": "Missing topic or intensity level"}), 400

    generated_cards = generate_study_materials(topic, test_name, intensity_level)

    if generated_cards:
        return jsonify({"message": "Flashcards generated and stored successfully", "flashcards": generated_cards}), 200
    else:
        return jsonify({"error": "Failed to generate flashcards"}), 500

@app.route('/get_flashcards', methods=['GET'])
def get_all_flashcards():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    flashcards_list = []
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, set_id, topic, test_name, intensity_level, front_text, back_text, created_at FROM flashcards ORDER BY created_at DESC, id ASC")
        rows = cur.fetchall()
        for row in rows:
            flashcards_list.append({
                "id": row[0],
                "set_id": str(row[1]),
                "topic": row[2],
                "test_name": row[3],
                "intensity_level": row[4],
                "front_text": row[5],
                "back_text": row[6],
                "created_at": row[7].isoformat()
            })
    except Exception as e:
        print(f"Error fetching flashcards from database: {e}")
        return jsonify({"error": "Failed to fetch flashcards"}), 500
    finally:
        if conn:
            cur.close()
            conn.close()

    return jsonify({"flashcards": flashcards_list}), 200

if __name__ == "__main__":
    app.run(debug=False, port=5000)