from flask import Blueprint, request, jsonify, session
from python_ai_service.db.database import get_db_connection
import datetime

progress_bp = Blueprint('progress', __name__)

@progress_bp.route('/progress/set/<set_id>', methods=['GET'])
def get_set_progress(set_id):
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT p.card_id, p.correct_count
                FROM study_progress p
                JOIN flashcards f ON p.card_id = f.id
                WHERE p.user_id = %s AND f.set_id = %s
            """, (user_id, set_id))
            progress_data = cur.fetchall()
            
            progress_map = {row[0]: row[1] for row in progress_data}
            
            return jsonify(progress_map)
    except Exception as e:
        print(f"Error fetching progress for set {set_id}: {e}")
        return jsonify({"error": "An error occurred while fetching progress"}), 500
    finally:
        conn.close()


@progress_bp.route('/progress/card/<int:card_id>', methods=['POST'])
def update_card_progress(card_id):
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401

    user_id = session['user_id']
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        with conn.cursor() as cur:
            # UPSERT operation: Insert or update the progress count
            cur.execute("""
                INSERT INTO study_progress (user_id, card_id, correct_count, last_correct_at)
                VALUES (%s, %s, 1, %s)
                ON CONFLICT (user_id, card_id) 
                DO UPDATE SET 
                    correct_count = study_progress.correct_count + 1,
                    last_correct_at = %s;
            """, (user_id, card_id, datetime.datetime.utcnow(), datetime.datetime.utcnow()))
        
        conn.commit()
        return jsonify({"message": "Progress updated successfully"}), 200
    except Exception as e:
        conn.rollback()
        print(f"Error updating progress for card {card_id}: {e}")
        return jsonify({"error": "Failed to update progress"}), 500
    finally:
        conn.close() 