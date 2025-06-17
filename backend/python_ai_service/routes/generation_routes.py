from flask import Blueprint, request, jsonify
from python_ai_service.services.flashcard_generator import generate_study_materials
from python_ai_service.db.database import get_db_connection
import uuid

generation_bp = Blueprint('generation', __name__)

@generation_bp.route('/generate_flashcards', methods=['POST'])
def generate_flashcards():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        topic = data.get('topic')
        test_name = data.get('test_name')
        intensity_level = data.get('intensity_level')

        if not all([topic, test_name, intensity_level]):
            return jsonify({"error": "Missing required fields"}), 400

        flashcards = generate_study_materials(topic, test_name, intensity_level)
        return jsonify({"message": "Flashcards generated successfully", "flashcards": flashcards})

    except Exception as e:
        return jsonify({"error": str(e)}), 500 