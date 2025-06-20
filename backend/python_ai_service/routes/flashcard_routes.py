from flask import Blueprint, request, jsonify, make_response, session
from python_ai_service.db.database import get_db_connection

flashcard_bp = Blueprint('flashcard', __name__)

@flashcard_bp.route('/get_flashcards', methods=['GET'])
def get_flashcards():
    try:
        # Check if user is authenticated
        if 'user_id' not in session:
            return jsonify({"error": "Authentication required"}), 401
            
        user_id = session['user_id']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get the most recent set for this user - match the column order: id, set_id, topic, intensity_level, card_count, created_at, name, user_id
        cursor.execute('''
            SELECT s.id, s.set_id, s.topic, s.intensity_level, s.card_count, s.created_at, s.name, s.user_id
            FROM sets s 
            WHERE s.user_id = %s
            ORDER BY s.created_at DESC 
            LIMIT 1
        ''', (user_id,))
        latest_set = cursor.fetchone()
        
        if not latest_set:
            return jsonify([])
        
        # Get flashcards for the most recent set - match the column order: id, set_id, front_text, back_text, created_at, star_status
        cursor.execute('''
            SELECT id, set_id, front_text, back_text, created_at, star_status
            FROM flashcards 
            WHERE set_id = %s 
            ORDER BY created_at DESC
        ''', (latest_set[1],))  # Use latest_set[1] for set_id
        flashcards = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify([{
            'id': card[0],
            'set_id': card[1],
            'front': card[2],  # front_text
            'back': card[3],   # back_text
            'created_at': card[4],
            'star_status': card[5]
        } for card in flashcards])
    except Exception as e:
        print(f"Error in get_flashcards: {str(e)}")  # Add debug logging
        return jsonify({'error': str(e)}), 500

@flashcard_bp.route('/get_flashcards_by_set/<set_id>', methods=['GET'])
def get_flashcards_by_set(set_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get set information - match the column order: id, set_id, topic, intensity_level, card_count, created_at, name
        cursor.execute('''
            SELECT id, set_id, topic, intensity_level, card_count, created_at, name
            FROM sets 
            WHERE set_id = %s
        ''', (set_id,))
        set_info = cursor.fetchone()
        
        if not set_info:
            return jsonify({'error': 'Set not found'}), 404
        
        # Get flashcards for this set - match the column order: id, set_id, front_text, back_text, created_at, star_status
        cursor.execute('''
            SELECT id, set_id, front_text, back_text, created_at, star_status
            FROM flashcards 
            WHERE set_id = %s 
            ORDER BY created_at DESC
        ''', (set_id,))
        flashcards = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({
            'set_info': {
                'id': set_info[0],
                'set_id': set_info[1],
                'topic': set_info[2],
                'intensity_level': set_info[3],
                'card_count': set_info[4],
                'created_at': set_info[5],
                'name': set_info[6]
            },
            'flashcards': [{
                'id': card[0],
                'set_id': card[1],
                'front': card[2],  # front_text
                'back': card[3],   # back_text
                'created_at': card[4],
                'star_status': card[5]
            } for card in flashcards]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@flashcard_bp.route('/get_all_sets', methods=['GET'])
def get_all_sets():
    try:
        # Check if user is authenticated
        if 'user_id' not in session:
            return jsonify({"error": "Authentication required"}), 401
            
        user_id = session['user_id']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, set_id, topic, intensity_level, card_count, created_at, name, user_id
            FROM sets 
            WHERE user_id = %s
            ORDER BY created_at DESC
        ''', (user_id,))
        sets = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify([{
            'id': set_data[0],
            'set_id': set_data[1],
            'topic': set_data[2],
            'intensity_level': set_data[3],
            'card_count': set_data[4],
            'created_at': set_data[5],
            'name': set_data[6],
            'user_id': set_data[7]
        } for set_data in sets])
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
            'set_id': updated_card[1],
            'front_text': updated_card[2],
            'back_text': updated_card[3],
            'star_status': updated_card[4],
            'created_at': updated_card[5]
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
            'set_id': updated_card[1],
            'front_text': updated_card[2],
            'back_text': updated_card[3],
            'star_status': updated_card[4],
            'created_at': updated_card[5]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@flashcard_bp.route('/update_set_name/<set_id>', methods=['PUT', 'OPTIONS'])
def update_set_name(set_id):
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'PUT')
        return response

    try:
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({'error': 'Missing name field'}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE sets SET name = %s WHERE set_id = %s RETURNING *',
            (data['name'], set_id)
        )
        updated_set = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()

        if not updated_set:
            return jsonify({'error': 'Set not found'}), 404

        return jsonify({
            'set_id': updated_set[1],
            'topic': updated_set[2],
            'intensity_level': updated_set[3],
            'card_count': updated_set[4],
            'created_at': updated_set[5],
            'name': updated_set[6],
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500 