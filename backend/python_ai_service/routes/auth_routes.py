from flask import Blueprint, request, jsonify, session, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from python_ai_service.db.database import get_db_connection
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return jsonify({"error": "Missing required fields"}), 400

        # Hash the password
        password_hash = generate_password_hash(password)

        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        try:
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
                (username, email, password_hash)
            )
            user_id = cur.fetchone()[0]
            conn.commit()
            
            # Create session
            session['user_id'] = user_id
            session['username'] = username
            
            response = jsonify({
                "message": "User registered successfully",
                "user": {
                    "id": user_id,
                    "username": username,
                    "email": email
                }
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
            
        except Exception as e:
            conn.rollback()
            if "duplicate key" in str(e).lower():
                return jsonify({"error": "Username or email already exists"}), 400
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close()
            conn.close()

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500

        try:
            cur = conn.cursor()
            cur.execute(
                "SELECT id, username, email, password_hash FROM users WHERE username = %s",
                (username,)
            )
            user = cur.fetchone()

            if not user or not check_password_hash(user[3], password):
                return jsonify({"error": "Invalid username or password"}), 401

            # Create session
            session['user_id'] = user[0]
            session['username'] = user[1]
            
            response = jsonify({
                "message": "Login successful",
                "user": {
                    "id": user[0],
                    "username": user[1],
                    "email": user[2]
                }
            })
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
            
        finally:
            cur.close()
            conn.close()

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/logout', methods=['POST', 'OPTIONS'])
def logout():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response
        
    session.clear()
    response = jsonify({"message": "Logout successful"})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@auth_bp.route('/check-auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        response = jsonify({
            "authenticated": True,
            "user": {
                "id": session['user_id'],
                "username": session['username']
            }
        })
    else:
        response = jsonify({"authenticated": False})
    
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response 