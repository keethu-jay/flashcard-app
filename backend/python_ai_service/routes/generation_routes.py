from flask import Blueprint, request, jsonify, make_response, session
from python_ai_service.services.flashcard_generator import generate_study_materials
from python_ai_service.db.database import get_db_connection
import uuid

generation_bp = Blueprint('generation', __name__)

@generation_bp.route('/generate_flashcards', methods=['POST', 'OPTIONS'])
def generate_flashcards():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
        
    try:
        # Check if user is authenticated
        if 'user_id' not in session:
            return jsonify({"error": "Authentication required"}), 401
            
        user_id = session['user_id']
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        topic = data.get('topic')
        test_name = data.get('test_name')
        intensity_level = data.get('intensity_level')
        context = data.get('context', '')
        custom_count = data.get('custom_count')

        print(f"Received request - Topic: {topic}, Test: {test_name}, Intensity: {intensity_level}, Custom Count: {custom_count}, User ID: {user_id}")

        # Make test_name optional, only topic and intensity_level are required
        if not topic or not intensity_level:
            return jsonify({"error": "Missing required fields: topic and intensity_level are required"}), 400

        # Handle empty or null test_name
        if not test_name or test_name.strip() == '':
            test_name = None

        # Handle custom_count - convert to int if provided
        if custom_count is not None:
            try:
                custom_count = int(custom_count)
                if custom_count <= 0:
                    return jsonify({"error": "Custom count must be a positive number"}), 400
            except (ValueError, TypeError):
                return jsonify({"error": "Custom count must be a valid number"}), 400

        # Call generate_study_materials with the custom count parameter and user_id
        print("Calling generate_study_materials...")
        flashcards = generate_study_materials(topic, test_name, intensity_level, custom_count, user_id)
        print(f"Generated {len(flashcards)} flashcards")
        
        # Get the set_id from the database (it should be the most recent set for this topic and user)
        conn = get_db_connection()
        set_id = None
        if conn:
            try:
                cur = conn.cursor()
                cur.execute(
                    "SELECT set_id FROM sets WHERE topic = %s AND user_id = %s ORDER BY created_at DESC LIMIT 1",
                    (topic, user_id)
                )
                result = cur.fetchone()
                if result:
                    set_id = result[0]
                cur.close()
            except Exception as e:
                print(f"Error getting set_id: {e}")
            finally:
                conn.close()
        
        response_data = {
            "message": "Flashcards generated successfully", 
            "flashcards": flashcards,
            "set_id": set_id
        }
        print(f"Returning response with {len(flashcards)} flashcards and set_id: {set_id}")
        
        response = jsonify(response_data)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    except Exception as e:
        print(f"Error in generate_flashcards: {e}")  # Add logging
        return jsonify({"error": str(e)}), 500 