from typing import Optional, List, Dict
import uuid
import os
from dotenv import load_dotenv
from transformers import pipeline
from langchain_huggingface import HuggingFacePipeline
from python_ai_service.db.database import get_db_connection
from psycopg2 import sql

# Load environment variables
load_dotenv()
api_key = os.getenv("HUGGINGFACE_API_KEY")

# Check if API key is available
if not api_key:
    raise ValueError("Hugging Face API key is missing. Please set it in your .env file.")

def initialize_model():
    try:
        # Set up the Hugging Face pipeline and LangChain wrapper
        llama3_pipeline = pipeline(
            task="text-generation",
            model="tiiuae/falcon-rw-1b",
            token=api_key,
            trust_remote_code=True,
            max_length=512,
            do_sample=True,
            temperature=0.1,
            max_new_tokens=256
        )
        print("Pipeline initialized successfully")
        
        llama3_llm = HuggingFacePipeline(
            pipeline=llama3_pipeline,
            model_kwargs={"temperature": 0.1}
        )
        print("LangChain wrapper initialized successfully")
        return llama3_pipeline, llama3_llm
    except Exception as e:
        print(f"Error initializing model: {str(e)}")
        raise

# Initialize the model
try:
    llama3_pipeline, llama3_llm = initialize_model()
except Exception as e:
    print(f"Failed to initialize model: {str(e)}")
    raise

def format_flashcards_to_json(raw_content: str) -> List[Dict]:
    """Convert raw flashcard content to JSON format."""
    try:
        # Split the content into individual flashcards
        cards = raw_content.strip().split('\n\n')
        formatted_cards = []
        
        for card in cards:
            if not card.strip():
                continue
                
            # Split into front and back
            parts = card.split('\nBack:')
            if len(parts) != 2:
                continue
                
            front = parts[0].replace('Front:', '').strip()
            back = parts[1].strip()
            
            formatted_cards.append({
                'front': front,
                'back': back
            })
            
        return formatted_cards
    except Exception as e:
        print(f"Error formatting flashcards: {e}")
        return []

def generate_study_materials(
        topic: str,
        test_name: Optional[str] = None,
        intensity_level: str = "general learning",
        custom_count: Optional[int] = None,
        user_id: Optional[int] = None
) -> List[Dict]:
    """Generate flashcards using HuggingFace pipeline with custom card counts."""
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
        prompt = f"""Create {num_cards} flashcards about {topic}{test_context}. {depth_description}

Please format each flashcard exactly as follows:
Front: [question or concept]
Back: [answer or explanation]

Example format:
Front: What is the capital of France?
Back: Paris

Make sure each flashcard is separated by a blank line and follows the Front: Back: format exactly."""

        print(f"Using prompt: {prompt[:200]}...")

        # Generate flashcards using the pipeline
        print(f"Generating text with prompt: {prompt[:100]}...")
        try:
            generated_text = llama3_llm.invoke(prompt)
            print(f"Generated text length: {len(generated_text) if generated_text else 0}")
            print(f"Generated text preview: {generated_text[:500] if generated_text else 'None'}...")
        except Exception as e:
            print(f"Error generating text: {e}")
            # Fall back to template-based flashcards
            generated_text = ""

        # Parse the result into flashcards
        print("Parsing generated text into flashcards...")
        flashcards = []
        current_card = {}
        
        # Try multiple parsing strategies
        lines = generated_text.split('\n') if generated_text else []
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Strategy 1: Look for "Front:" and "Back:" format
            if line.startswith('Front:'):
                if current_card and current_card.get('front'):
                    flashcards.append(current_card)
                current_card = {'front': line[6:].strip(), 'back': ''}
            elif line.startswith('Back:'):
                if current_card:
                    current_card['back'] = line[5:].strip()
            # Strategy 2: Look for numbered questions
            elif line.startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.')):
                if current_card and current_card.get('front'):
                    flashcards.append(current_card)
                current_card = {'front': line[3:].strip(), 'back': ''}
            # Strategy 3: Look for "Q:" and "A:" format
            elif line.startswith('Q:'):
                if current_card and current_card.get('front'):
                    flashcards.append(current_card)
                current_card = {'front': line[2:].strip(), 'back': ''}
            elif line.startswith('A:'):
                if current_card:
                    current_card['back'] = line[2:].strip()
                    
        if current_card and current_card.get('front'):
            flashcards.append(current_card)

        print(f"Parsed {len(flashcards)} flashcards from generated text")
        if flashcards:
            print(f"Sample flashcard: Front: {flashcards[0].get('front', '')[:50]}... Back: {flashcards[0].get('back', '')[:50]}...")

        # If parsing failed or no cards generated, create template-based flashcards
        if not flashcards:
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
        return [{"front": "Error", "back": f"Failed to generate flashcards: {str(error)}"}] 