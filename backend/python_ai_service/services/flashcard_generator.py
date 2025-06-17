from typing import Optional, List, Dict
import uuid
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain, SequentialChain
from python_ai_service.db.database import get_db_connection
from psycopg2 import sql

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

def generate_study_materials(topic: str, test_name: str, intensity_level: str) -> Optional[List[Dict]]:
    """Generate flashcards using LangChain and OpenAI."""
    try:
        # Initialize the language model
        llm = ChatOpenAI(
            model_name="gpt-3.5-turbo",
            temperature=0.7
        )

        # Create the first chain for generating flashcards
        flashcard_prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful AI that creates educational flashcards."),
            ("user", """Create 5 detailed flashcards for the following topic:
            Topic: {topic}
            Test: {test_name}
            Intensity Level: {intensity_level}
            
            Format each flashcard as:
            Front: [question or term]
            Back: [detailed answer or definition]
            
            Make the content appropriate for the specified intensity level.""")
        ])

        flashcard_chain = LLMChain(
            llm=llm,
            prompt=flashcard_prompt,
            output_key="raw_flashcards"
        )

        # Create the second chain for formatting
        format_prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful AI that formats flashcard content into JSON."),
            ("user", "Format the following flashcards into JSON:\n{raw_flashcards}")
        ])

        format_chain = LLMChain(
            llm=llm,
            prompt=format_prompt,
            output_key="formatted_flashcards"
        )

        # Combine the chains
        overall_chain = SequentialChain(
            chains=[flashcard_chain, format_chain],
            input_variables=["topic", "test_name", "intensity_level"],
            output_variables=["formatted_flashcards"]
        )

        # Generate the flashcards
        result = overall_chain({
            "topic": topic,
            "test_name": test_name,
            "intensity_level": intensity_level
        })

        # Parse the formatted flashcards
        formatted_cards = format_flashcards_to_json(result["formatted_flashcards"])
        
        # Store in database
        if formatted_cards:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            for card in formatted_cards:
                cursor.execute(
                    'INSERT INTO flashcards (front, back, star_status) VALUES (%s, %s, false)',
                    (card['front'], card['back'])
                )
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return formatted_cards
            
        return None

    except Exception as e:
        print(f"Error generating flashcards: {e}")
        return None

def format_flashcards_to_json(content: str) -> list[dict]:
    """Convert raw flashcard content into a JSON array of flashcards."""
    flashcards = []

    # Split content into lines and process each line
    lines = content.strip().split('\n')
    current_front = None

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Look for question/answer patterns
        if line.startswith('Q:') or line.startswith('Question:'):
            if current_front:  # Save previous card if exists
                flashcards.append({"front": current_front, "back": "No answer provided"})
            current_front = line.split(':', 1)[1].strip()
        elif line.startswith('A:') or line.startswith('Answer:'):
            if current_front:
                answer = line.split(':', 1)[1].strip()
                flashcards.append({"front": current_front, "back": answer})
                current_front = None
        elif current_front:  # If we have a question but no answer yet
            flashcards.append({"front": current_front, "back": line})
            current_front = None
        else:  # Assume it's a new question
            current_front = line

    # Add any remaining card
    if current_front:
        flashcards.append({"front": current_front, "back": "No answer provided"})

    return flashcards

def generate_study_materials(
        topic: str,
        test_name: Optional[str] = None,
        intensity_level: str = "general learning"
) -> List[Dict]:
    try:
        # Initialize the LLM with temperature 0 for consistent output
        llm = ChatOpenAI(temperature=0, model="gpt-3.5-turbo")

        # First chain: Generate raw flashcards
        first_prompt = ChatPromptTemplate.from_template(
            """Create {num_cards} flashcards about {topic}{test_context}.
            {depth_description}
            {true_false_ratio}
            
            Format each flashcard as:
            Front: [question]
            Back: [answer]
            
            Make sure each flashcard is on a new line and follows the exact format above."""
        )

        # Second chain: Format flashcards into structured JSON
        second_prompt = ChatPromptTemplate.from_template(
            """Convert the following flashcards into a structured format:
            {raw_flashcards}
            
            Format each flashcard as:
            Front: [question]
            Back: [answer]
            
            Ensure each flashcard is properly formatted with Front and Back fields."""
        )

        # Set up the chains
        chain_one = LLMChain(
            llm=llm,
            prompt=first_prompt,
            output_key="raw_flashcards"
        )
        chain_two = LLMChain(
            llm=llm,
            prompt=second_prompt
        )

        # Create the sequential chain
        overall_chain = SequentialChain(
            chains=[chain_one, chain_two],
            input_variables=["num_cards", "topic", "test_context", "depth_description", "true_false_ratio"],
            verbose=True
        )

        # Determine number of cards and depth based on intensity level
        intensity_level = intensity_level.lower()
        if "casual" in intensity_level:
            num_cards = 5
            depth_description = "Keep definitions concise and explanations brief."
            true_false_ratio = "Include 1-2 true/false questions."
        elif "personal" in intensity_level:
            num_cards = 10
            depth_description = "Focus on key concepts and their applications."
            true_false_ratio = "Include 3-4 true/false questions."
        else:  # comprehensive test prep
            num_cards = 20
            depth_description = "Provide in-depth explanations with examples, applications, and potential exam scenarios. Include both theoretical concepts and practical applications."
            true_false_ratio = "Include 5-7 true/false questions and ensure they test nuanced understanding."

        # Run the chain
        test_context = f" focusing on {test_name}" if test_name else ""
        result = overall_chain({
            "num_cards": num_cards,
            "topic": topic,
            "test_context": test_context,
            "depth_description": depth_description,
            "true_false_ratio": true_false_ratio
        })

        # Parse the result into flashcards
        flashcards = []
        current_card = {}
        
        for line in result['text'].split('\n'):
            line = line.strip()
            if line.startswith('Front:'):
                if current_card:
                    flashcards.append(current_card)
                current_card = {'front': line[6:].strip(), 'back': ''}
            elif line.startswith('Back:'):
                if current_card:
                    current_card['back'] = line[5:].strip()

        if current_card:
            flashcards.append(current_card)

        # Store flashcards in database
        conn = get_db_connection()
        if conn:
            try:
                cur = conn.cursor()
                set_id = str(uuid.uuid4())
                
                for card in flashcards:
                    cur.execute(
                        sql.SQL("""
                            INSERT INTO flashcards 
                            (set_id, topic, test_name, intensity_level, front_text, back_text)
                            VALUES (%s, %s, %s, %s, %s, %s)
                        """),
                        (set_id, topic, test_name, intensity_level, card['front'], card['back'])
                    )
                
                conn.commit()
                print(f"Successfully stored {len(flashcards)} flashcards in database")
            except Exception as e:
                print(f"Error storing flashcards in database: {e}")
                conn.rollback()
            finally:
                cur.close()
                conn.close()

        return flashcards

    except Exception as error:
        print(f"Error in generate_study_materials: {error}")
        return [{"front": "Error", "back": f"Failed to generate flashcards: {str(error)}"}] 