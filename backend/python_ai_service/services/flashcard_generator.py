from typing import Optional, List, Dict
import uuid
import os
import json
from dotenv import load_dotenv
import anthropic
from python_ai_service.db.database import get_db_connection
from psycopg2 import sql

# Load environment variables
load_dotenv()
api_key = os.getenv("ANTHROPIC_API_KEY")

# Check if API key is available
if not api_key:
    raise ValueError("Anthropic API key is missing. Please set ANTHROPIC_API_KEY in your .env file.")

# Initialize Anthropic client
client = anthropic.Anthropic(api_key=api_key)

def generate_study_materials(
        topic: str,
        test_name: Optional[str] = None,
        intensity_level: str = "general learning",
        custom_count: Optional[int] = None,
        user_id: Optional[int] = None
) -> List[Dict]:
    """Generate flashcards using Claude 3 Haiku API."""
    try:
        # Determine number of cards based on intensity level or custom count
        if custom_count and custom_count > 0:
            num_cards = custom_count
            depth_description = "Custom number of cards. Provide a mix of definitions, concepts, and true/false questions."
        else:
            intensity_level = intensity_level.lower()
            if "casual" in intensity_level:
                num_cards = 50
                depth_description = "Keep definitions concise and explanations brief."
            elif "personal" in intensity_level:
                num_cards = 80
                depth_description = "Focus on key concepts and their applications."
            else:  # comprehensive test prep
                num_cards = 120
                depth_description = "Provide in-depth explanations with examples and applications."

        test_context = f" focusing on {test_name}" if test_name else ""
        
        # Create a more structured prompt for better JSON output
        prompt = f"""Create {num_cards} high-quality flashcards about {topic}{test_context}. {depth_description}

IMPORTANT: Return ONLY a valid JSON array of objects. Each object should have exactly two fields:
- "front": The question or concept (string)
- "back": The answer or explanation (string)

Example format:
[
  {{"front": "What is the capital of France?", "back": "Paris"}},
  {{"front": "Define photosynthesis", "back": "The process by which plants convert sunlight into energy"}}
]

Make sure the response is valid JSON that can be parsed directly. Do not include any text before or after the JSON array."""

        print(f"Generating {num_cards} flashcards for topic: {topic}")
        print(f"Using prompt: {prompt[:200]}...")

        # Generate flashcards using Claude 3 Haiku
        try:
            response = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=4000,
                temperature=0.3,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            generated_content = response.content[0].text
            print(f"Generated content length: {len(generated_content)}")
            print(f"Generated content preview: {generated_content[:500]}...")
            
            # Parse the JSON response
            try:
                flashcards = json.loads(generated_content)
                if not isinstance(flashcards, list):
                    raise ValueError("Response is not a list")
                    
                # Validate each flashcard has the required fields
                validated_flashcards = []
                for card in flashcards:
                    if isinstance(card, dict) and 'front' in card and 'back' in card:
                        validated_flashcards.append({
                            'front': str(card['front']),
                            'back': str(card['back'])
                        })
                
                flashcards = validated_flashcards
                print(f"Successfully parsed {len(flashcards)} flashcards from JSON")
                
            except json.JSONDecodeError as e:
                print(f"Failed to parse JSON: {e}")
                print(f"Raw response: {generated_content}")
                flashcards = []
                
        except Exception as e:
            print(f"Error calling Claude API: {e}")
            flashcards = []

        # If API call failed or parsing failed, create template-based flashcards
        if not flashcards:
            print("Falling back to template-based flashcards")
            flashcards = [
                {"front": f"What is {topic}?", "back": f"{topic} is a subject area that involves studying and understanding various concepts and principles."},
                {"front": f"Define {topic}", "back": f"The study or practice of {topic} encompasses learning about its fundamental concepts and applications."},
                {"front": f"True or False: {topic} is an important field of study", "back": "True"},
                {"front": f"What are the main components of {topic}?", "back": f"The main components of {topic} include core concepts, principles, and practical applications."},
                {"front": f"How is {topic} used in practice?", "back": f"{topic} is used in various real-world applications and helps solve practical problems."},
            ]
            while len(flashcards) < num_cards:
                flashcards.extend([
                    {"front": f"What are the key principles of {topic}?", "back": f"The key principles of {topic} include understanding fundamental concepts, applying knowledge, and continuous learning."},
                    {"front": f"True or False: {topic} requires memorization only", "back": "False - understanding and application are also important."},
                    {"front": f"What skills are developed through studying {topic}?", "back": f"Studying {topic} develops critical thinking, problem-solving, and analytical skills."},
                    {"front": f"How does {topic} relate to other subjects?", "back": f"{topic} often connects with other fields and can be applied across different disciplines."},
                    {"front": f"What are common misconceptions about {topic}?", "back": f"Common misconceptions include thinking it's too difficult or not practical, when it's actually accessible and useful."}
                ])
            if test_name:
                flashcards.extend([
                    {"front": f"How does {topic} relate to {test_name}?", "back": f"{topic} provides the foundational knowledge needed for {test_name}."},
                    {"front": f"What {topic} concepts are most important for {test_name}?", "back": f"Key {topic} concepts for {test_name} include fundamental principles and core applications."}
                ])
            flashcards = flashcards[:num_cards]

        # Store flashcards in database
        print(f"Attempting to store {len(flashcards)} flashcards in database...")
        conn = get_db_connection()
        if conn:
            try:
                cur = conn.cursor()
                set_id = str(uuid.uuid4())
                print(f"Generated set_id: {set_id}")
                
                # Insert the set with user_id
                cur.execute(
                    sql.SQL("""
                        INSERT INTO sets 
                        (set_id, topic, intensity_level, card_count, name, user_id)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        RETURNING id
                    """),
                    (set_id, topic, intensity_level, len(flashcards), f"{topic} Study Set", user_id)
                )
                set_record = cur.fetchone()
                print(f"Inserted set with id: {set_record[0] if set_record else 'None'}")
                conn.commit()
                
                # Insert flashcards
                for i, card in enumerate(flashcards):
                    cur.execute(
                        sql.SQL("""
                            INSERT INTO flashcards 
                            (set_id, front_text, back_text, star_status)
                            VALUES (%s, %s, %s, false)
                        """),
                        (set_id, card['front'], card['back'])
                    )
                    if i % 10 == 0:  # Log every 10th card
                        print(f"Inserted flashcard {i+1}/{len(flashcards)}")
                
                conn.commit()
                print(f"Successfully stored all {len(flashcards)} flashcards")
            except Exception as e:
                print(f"Database error: {e}")
                conn.rollback()
            finally:
                cur.close()
                conn.close()
        else:
            print("Failed to get database connection")
        
        print(f"Returning {len(flashcards)} flashcards")
        return flashcards
    except Exception as error:
        print(f"Error in generate_study_materials: {error}")
        return [{"front": "Error", "back": f"Failed to generate flashcards: {str(error)}"}] 