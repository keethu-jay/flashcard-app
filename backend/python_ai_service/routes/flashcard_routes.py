from flask import Blueprint, request, jsonify, make_response
from python_ai_service.db.database import get_db_connection

flashcard_bp = Blueprint('flashcard', __name__)

@flashcard_bp.route('/get_flashcards', methods=['GET'])
def get_flashcards():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM flashcards ORDER BY created_at DESC')
        flashcards = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify([{
            'id': card[0],
            'front': card[5],
            'back': card[6],
            'star_status': card[8],
            'created_at': card[7]
        } for card in flashcards])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@flashcard_bp.route('/update_flashcard/<int:card_id>', methods=['PUT', 'OPTIONS'])
def update_flashcard(card_id):
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'PUT')
        return response

    try:
        data = request.get_json()
        if not data or 'front' not in data or 'back' not in data:
            return jsonify({'error': 'Missing front or back text'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE flashcards SET front_text = %s, back_text = %s WHERE id = %s RETURNING *',
            (data['front'], data['back'], card_id)
        )
        updated_card = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()

        if not updated_card:
            return jsonify({'error': 'Flashcard not found'}), 404

        return jsonify({
            'id': updated_card[0],
            'front': updated_card[5],
            'back': updated_card[6],
            'star_status': updated_card[8],
            'created_at': updated_card[7]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@flashcard_bp.route('/toggle_star/<int:card_id>', methods=['PUT', 'OPTIONS'])
def toggle_star(card_id):
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'PUT')
        return response

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE flashcards SET star_status = NOT star_status WHERE id = %s RETURNING *',
            (card_id,)
        )
        updated_card = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()

        if not updated_card:
            return jsonify({'error': 'Flashcard not found'}), 404

        return jsonify({
            'id': updated_card[0],
            'front': updated_card[1],
            'back': updated_card[2],
            'star_status': updated_card[3],
            'created_at': updated_card[4]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500 