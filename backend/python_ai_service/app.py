import os
import dotenv
from transformers import pipeline, AutoTokenizer
from langchain_huggingface import HuggingFacePipeline
import json
from typing import Optional
import psycopg2 # Import psycopg2
from psycopg2 import sql # For safe query building
from flask import Flask, request, jsonify # Import Flask components
from flask_cors import CORS # Import CORS for cross-origin requests
import uuid # For generating UUIDs for set_id

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app) # Enable CORS for all routes (important for frontend communication)

# Load environment variables
dotenv.load_dotenv()
api_key = os.getenv("HUGGINGFACE_API_KEY")

# Check if API key is available
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
flanT5_pipeline = pipeline(
    "summarization",
    model="google/flan-t5-small",
    token=api_key
)

llama_model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
llama_tokenizer = AutoTokenizer.from_pretrained(llama_model_name, token=api_key)

llama3_pipeline = pipeline(
    "text-generation",
    model=llama_model_name,
    token=api_key,
    max_new_tokens=512,
    do_sample=True,
    temperature=0.7,
    top_k=50,
    top_p=0.95,
    pad_token_id=llama_tokenizer.pad_token_id if llama_tokenizer.pad_token_id is not None else llama_tokenizer.eos_token_id,
    eos_token_id=llama_tokenizer.eos_token_id,
    return_full_text=False
)

# Wrap them inside LangChain
flanT5_llm = HuggingFacePipeline(pipeline=flanT5_pipeline)
llama3_llm = HuggingFacePipeline(pipeline=llama3_pipeline)


# --- AI Function Definitions ---
def summarize_performance(studyData: str) -> str:
    try:
        prompt = f"Summarize the following study performance data: {studyData}"
        response = flanT5_llm.invoke(prompt)
        return response
    except Exception as error:
        print("Error summarizing study performance:", error)
        return "Failed to summarize study performance"

# Function to generate study materials (UPDATED to store in DB)
def generate_study_materials(
        topic: str,
        test_name: Optional[str] = None,
        intensity_level: str = "general learning"
) -> list[dict]:
    # ... (existing prompt construction logic - no changes) ...
    try:
        prompt_parts = []
        prompt_parts.append(f"Generate a list of flashcards for the topic: '{topic}'.")

        if test_name:
            prompt_parts.append(f"Focus on concepts highly relevant to the '{test_name}' exam.")

        num_cards = 0
        depth_description = ""
        true_false_ratio = ""

        intensity_level_lower = intensity_level.lower()

        if "casual" in intensity_level_lower or "general" in intensity_level_lower:
            num_cards = 5
            depth_description = "Keep definitions concise and explanations brief."
            true_false_ratio = "Include 1-2 true/false questions and the rest as definitions."
        elif "exam prep" in intensity_level_lower or "exam" in intensity_level_lower:
            num_cards = 10
            depth_description = "Provide moderately in-depth definitions and explanations suitable for exam review."
            true_false_ratio = "Include 3-4 true/false questions and the rest as definitions."
        elif "comprehensive" in intensity_level_lower or "in-depth" in intensity_level_lower:
            num_cards = 15
            depth_description = "Offer comprehensive and detailed definitions with thorough explanations."
            true_false_ratio = "Include 5-7 true/false questions and the rest as definitions."
        else:
            num_cards = 8
            depth_description = "Provide standard definitions and explanations."
            true_false_ratio = "Include 2-3 true/false questions and the rest as definitions."

        prompt_parts.append(f"Generate exactly {num_cards} flashcards.")
        prompt_parts.append(depth_description)
        prompt_parts.append(true_false_ratio)
        prompt_parts.append("Your output MUST be a JSON array of objects. Each object should have two keys: 'front' (for the question/term) and 'back' (for the answer/definition). Ensure the JSON is well-formed.")
        prompt_parts.append("Example format: [{'front': 'Question 1', 'back': 'Answer 1'}, {'front': 'Question 2', 'back': 'Answer 2'}]")

        full_prompt_content = " ".join(prompt_parts)
        print(f"--- Sending Prompt to LLM ---\n{full_prompt_content}\n-----------------------------")

        raw_response = llama3_llm.invoke(full_prompt_content)
        print(f"--- Raw LLM Response ---\n{raw_response}\n--------------------------")

        json_string = ""
        example_output_marker = "Example output: "
        if example_output_marker in raw_response:
            start_index = raw_response.find(example_output_marker) + len(example_output_marker)
            potential_json_string = raw_response[start_index:].strip()
        else:
            potential_json_string = raw_response

        json_start = potential_json_string.find('[')
        json_end = potential_json_string.rfind(']')

        if json_start != -1 and json_end != -1 and json_end > json_start:
            json_string = potential_json_string[json_start : json_end + 1]
        else:
            code_block_start = potential_json_string.find('```json')
            code_block_end = potential_json_string.rfind('```')
            if code_block_start != -1 and code_block_end != -1 and code_block_end > code_block_start:
                json_string = potential_json_string[code_block_start + len('```json'):code_block_end].strip()
                json_start = json_string.find('[')
                json_end = json_string.rfind(']')
                if json_start != -1 and json_end != -1 and json_end > json_start:
                    json_string = json_string[json_start : json_end + 1]
                else:
                    raise ValueError("Could not find a valid JSON array structure in LLM response (even in code block).")
            else:
                raise ValueError("Could not find a valid JSON array structure in the LLM response (missing [] or code block).")

        json_string = json_string.replace("'", '"')
        json_string = json_string.replace('```json', '').replace('```', '').strip()

        flashcards = json.loads(json_string)

        if not isinstance(flashcards, list):
            raise ValueError("LLM did not return a JSON array.")
        for card in flashcards:
            if not isinstance(card, dict) or 'front' not in card or 'back' not in card:
                raise ValueError("Each flashcard in the JSON array must be an object with 'front' and 'back' keys.")

        # --- Database Storage ---
        conn = get_db_connection()
        if conn:
            try:
                cur = conn.cursor()

                # Generate a unique set_id for this batch of flashcards
                current_set_id = str(uuid.uuid4()) # Generate a UUID string

                for card in flashcards:
                    cur.execute(
                        sql.SQL("INSERT INTO flashcards (set_id, topic, test_name, intensity_level, front_text, back_text) VALUES (%s, %s, %s, %s, %s, %s)"),
                        [current_set_id, topic, test_name, intensity_level, card.get('front'), card.get('back')]
                    )

                conn.commit()
                print(f"Successfully stored {len(flashcards)} flashcards for topic '{topic}' with set_id '{current_set_id}' in the database.")

            except Exception as db_error:
                conn.rollback() # Rollback changes if error occurs
                print(f"Database error during flashcard storage: {db_error}")
            finally:
                cur.close()
                conn.close()
        # --- End Database Storage ---

        return flashcards

    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from LLM response: {e}")
        print(f"Faulty JSON string might be (first 500 chars): {json_string[:500]}...")
        return []
    except ValueError as e:
        print(f"Error processing LLM response: {e}")
        return []
    except Exception as error:
        print("Error generating study materials:", error)
        return []

# --- Flask Routes ---

# Endpoint to generate flashcards
@app.route('/generate_flashcards', methods=['POST'])
def api_generate_flashcards():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    topic = data.get('topic')
    test_name = data.get('test') # 'test' from frontend formData
    intensity_level = data.get('depth') # 'depth' from frontend formData

    if not topic or not intensity_level:
        return jsonify({"error": "Missing topic or intensity level"}), 400

    # Call your core AI function
    generated_cards = generate_study_materials(topic, test_name, intensity_level)

    if generated_cards:
        return jsonify({"message": "Flashcards generated and stored successfully", "flashcards": generated_cards}), 200
    else:
        return jsonify({"error": "Failed to generate flashcards"}), 500

# Endpoint to get all stored flashcards
@app.route('/get_flashcards', methods=['GET'])
def get_all_flashcards():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    flashcards_list = []
    try:
        cur = conn.cursor()
        # Order by set_id to keep sets together, then by creation date for stability
        cur.execute("SELECT id, set_id, topic, test_name, intensity_level, front_text, back_text, created_at FROM flashcards ORDER BY created_at DESC, id ASC")
        rows = cur.fetchall()
        for row in rows:
            flashcards_list.append({
                "id": row[0],
                "set_id": str(row[1]), # Convert UUID object to string
                "topic": row[2],
                "test_name": row[3],
                "intensity_level": row[4],
                "front_text": row[5],
                "back_text": row[6],
                "created_at": row[7].isoformat() # Convert datetime object to ISO string
            })
    except Exception as e:
        print(f"Error fetching flashcards from database: {e}")
        return jsonify({"error": "Failed to fetch flashcards"}), 500
    finally:
        if conn:
            cur.close()
            conn.close()

    return jsonify({"flashcards": flashcards_list}), 200


# --- Flask App Run ---
if __name__ == "__main__":
    # --- COMMENT OUT OR REMOVE THE TEST BLOCK WHEN RUNNING AS FLASK APP ---
    # print("--- Testing API Generation ---")
    # topic1 = "Dinosaurs"
    # test_name1 = None
    # intensity1 = "casual learning"
    # print(f"\nGenerating flashcards for: Topic='{topic1}', Test='{test_name1}', Intensity='{intensity1}'")
    # flashcards_output1 = generate_study_materials(topic1, test_name1, intensity1)
    # if flashcards_output1:
    #     print("Generated Flashcards (Parsed Output 1):")
    #     for i, card in enumerate(flashcards_output1):
    #         print(f"  Flashcard {i+1}:")
    #         print(f"    Front: {card.get('front', 'N/A')}")
    #         print(f"    Back: {card.get('back', 'N/A')}")
    # else:
    #     print("  Failed to generate flashcards for Test 1.")
    # print("-" * 50)
    # # ... (rest of your test cases) ...
    # print("--- Testing Complete ---")
    # --- END COMMENT OUT ---

    # --- Run Flask App ---
    app.run(debug=True, port=5000) # Run on port 5000, debug=True for development