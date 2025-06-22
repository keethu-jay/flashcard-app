from flask import Blueprint, request, jsonify, session
from python_ai_service.services.flashcard_generator import generate_study_materials
from python_ai_service.db.database import get_db_connection
import uuid

generation_bp = Blueprint('generation', __name__)

@generation_bp.route('/generate_flashcards', methods=['POST'])
def generate_flashcards():
    try:
        print("GENERATION ROUTE: Session data:", dict(session))
        if 'user_id' not in session:
            print("GENERATION ROUTE: Auth failed. 'user_id' not in session.")
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

        if not topic or not intensity_level:
            return jsonify({"error": "Missing required fields: topic and intensity_level are required"}), 400

        if not test_name or test_name.strip() == '':
            test_name = None

        flashcards = generate_study_materials(
            topic=topic,
            test_name=test_name,
            intensity_level=intensity_level,
            custom_count=custom_count,
            user_id=user_id
        )

        return jsonify(flashcards)
    except Exception as error:
        print(f"Error in generate_flashcards route: {error}")
        return jsonify({"error": f"An unexpected error occurred: {str(error)}"}), 500 