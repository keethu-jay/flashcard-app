import uuid
from flask import Blueprint, request, jsonify, session
from python_ai_service.db.database import get_db_connection

flashcard_bp = Blueprint('flashcard', __name__)

@flashcard_bp.route('/get_flashcards', methods=['GET'])
def get_flashcards():
    try:
        if 'user_id' not in session:
            return jsonify({"error": "Authentication required"}), 401
            
        user_id = session['user_id']
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
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
        
        cursor.execute('''
            SELECT id, set_id, front_text, back_text, created_at, star_status
            FROM flashcards 
            WHERE set_id = %s 
            ORDER BY created_at DESC
        ''', (latest_set[1],))
        flashcards = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify([{
            'id': card[0],
            'set_id': card[1],
            'front': card[2],
            'back': card[3],
            'created_at': card[4],
            'star_status': card[5]
        } for card in flashcards])
    except Exception as e:
        print(f"Error in get_flashcards: {str(e)}")
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

@flashcard_bp.route('/update_flashcard/<int:card_id>', methods=['PUT'])
def update_flashcard(card_id):
    try:
        if 'user_id' not in session:
            return jsonify({"error": "Authentication required"}), 401

        data = request.get_json()
        front_text = data.get('front')
        back_text = data.get('back')

        if not front_text or not back_text:
            return jsonify({"error": "Front and back text are required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE flashcards SET front_text = %s, back_text = %s WHERE id = %s",
            (front_text, back_text, card_id)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Flashcard updated successfully"})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@flashcard_bp.route('/toggle_star/<int:card_id>', methods=['PUT'])
def toggle_star(card_id):
    try:
        if 'user_id' not in session:
            return jsonify({"error": "Authentication required"}), 401

        data = request.get_json()
        star_status = data.get('star_status')

        if star_status is None:
            return jsonify({"error": "Star status is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE flashcards SET star_status = %s WHERE id = %s",
            (star_status, card_id)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Star status updated successfully"})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@flashcard_bp.route('/update_set_name/<set_id>', methods=['PUT'])
def update_set_name(set_id):
    try:
        if 'user_id' not in session:
            return jsonify({"error": "Authentication required"}), 401

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

@flashcard_bp.route('/create_manual_set', methods=['POST'])
def create_manual_set():
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401

    data = request.get_json()
    name = data.get('name')
    cards = data.get('cards')
    user_id = session['user_id']

    if not name or not cards:
        return jsonify({"error": "Set name and cards are required"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor() as cur:
            set_id = str(uuid.uuid4())
            
            # Insert the new set
            cur.execute(
                """
                INSERT INTO sets (set_id, topic, intensity_level, card_count, name, user_id)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (set_id, name, 'manual', len(cards), name, user_id)
            )

            # Insert flashcards
            for card in cards:
                cur.execute(
                    """
                    INSERT INTO flashcards (set_id, front_text, back_text, star_status)
                    VALUES (%s, %s, %s, false)
                    """,
                    (set_id, card.get('front'), card.get('back'))
                )
        
        conn.commit()
        return jsonify({"message": "Set created successfully", "set_id": set_id}), 201
    
    except Exception as e:
        conn.rollback()
        print(f"Error creating manual set: {e}")
        return jsonify({"error": "Failed to create set"}), 500
    
    finally:
        conn.close() 