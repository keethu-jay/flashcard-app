from flask import Blueprint, request, jsonify, session
from python_ai_service.db.database import get_db_connection

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/profile', methods=['GET'])
def get_user_profile():
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401
    
    user_id = session['user_id']
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
        
    try:
        with conn.cursor() as cur:
            # Assuming 'bio' and 'profile_image_url' columns exist or will be added
            cur.execute(
                "SELECT username, email, bio, profile_image_url FROM users WHERE id = %s",
                (user_id,)
            )
            user = cur.fetchone()
            if user:
                return jsonify({
                    "username": user[0],
                    "email": user[1],
                    "bio": user[2],
                    "profile_image_url": user[3]
                })
            else:
                return jsonify({"error": "User not found"}), 404
    except Exception as e:
        # Gracefully handle missing columns
        if 'column "bio" does not exist' in str(e) or 'column "profile_image_url" does not exist' in str(e):
             # Rerun query without the new columns
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT username, email FROM users WHERE id = %s",
                    (user_id,)
                )
                user = cur.fetchone()
                if user:
                    return jsonify({
                        "username": user[0],
                        "email": user[1],
                        "bio": "This is a default biography.",
                        "profile_image_url": None
                    })
                else:
                    return jsonify({"error": "User not found"}), 404
        print(f"Error fetching profile: {e}")
        return jsonify({"error": "An error occurred while fetching the profile"}), 500
    finally:
        conn.close()

@profile_bp.route('/profile', methods=['PUT'])
def update_user_profile():
    if 'user_id' not in session:
        return jsonify({"error": "Authentication required"}), 401

    user_id = session['user_id']
    data = request.get_json()
    bio = data.get('bio')
    profile_image_url = data.get('profile_image_url')

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor() as cur:
            # This will fail if the columns don't exist. 
            # This should be paired with a database migration.
            cur.execute(
                "UPDATE users SET bio = %s, profile_image_url = %s WHERE id = %s",
                (bio, profile_image_url, user_id)
            )
        conn.commit()
        return jsonify({"message": "Profile updated successfully"})
    except Exception as e:
        conn.rollback()
        print(f"Error updating profile: {e}")
        # A more robust solution would be to check for the specific "column does not exist" error
        return jsonify({"error": "Failed to update profile. Columns may be missing."}), 500
    finally:
        conn.close() 