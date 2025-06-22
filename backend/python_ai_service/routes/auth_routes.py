from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from python_ai_service.db.database import get_db_connection
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        print("Registration request received")
        data = request.get_json()
        if not data:
            print("No JSON data provided")
            return jsonify({"error": "No JSON data provided"}), 400

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        print(f"Registration attempt for username: {username}, email: {email}")

        if not username or not email or not password:
            print("Missing required fields")
            return jsonify({"error": "Missing required fields"}), 400

        password_hash = generate_password_hash(password)

        conn = get_db_connection()
        if not conn:
            print("Database connection failed")
            return jsonify({"error": "Database connection failed"}), 500

        try:
            cur = conn.cursor()
            print("Attempting to insert user into database")
            cur.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
                (username, email, password_hash)
            )
            user_id = cur.fetchone()[0]
            conn.commit()
            print(f"User registered successfully with ID: {user_id}")
            
            session['user_id'] = user_id
            session['username'] = username
            
            return jsonify({
                "message": "User registered successfully",
                "user": {
                    "id": user_id,
                    "username": username,
                    "email": email
                }
            })
            
        except Exception as e:
            conn.rollback()
            print(f"Database error during registration: {e}")
            if "duplicate key" in str(e).lower():
                return jsonify({"error": "Username or email already exists"}), 400
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        finally:
            cur.close()
            conn.close()

    except Exception as e:
        print(f"Unexpected error during registration: {e}")
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        print("Login request received")
        data = request.get_json()
        if not data:
            print("No JSON data provided")
            return jsonify({"error": "No JSON data provided"}), 400

        username = data.get('username')
        password = data.get('password')

        print(f"Login attempt for username: {username}")

        if not username or not password:
            print("Missing username or password")
            return jsonify({"error": "Missing username or password"}), 400

        conn = get_db_connection()
        if not conn:
            print("Database connection failed")
            return jsonify({"error": "Database connection failed"}), 500

        try:
            cur = conn.cursor()
            cur.execute(
                "SELECT id, username, email, password_hash FROM users WHERE username = %s",
                (username,)
            )
            user = cur.fetchone()

            if not user or not check_password_hash(user[3], password):
                print("Invalid username or password")
                return jsonify({"error": "Invalid username or password"}), 401

            print(f"Login successful for user: {username}")
            session['user_id'] = user[0]
            session['username'] = user[1]
            
            return jsonify({
                "message": "Login successful",
                "user": {
                    "id": user[0],
                    "username": user[1],
                    "email": user[2]
                }
            })
            
        finally:
            cur.close()
            conn.close()

    except Exception as e:
        print(f"Unexpected error during login: {e}")
        return jsonify({"error": f"Login failed: {str(e)}"}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logout successful"})

@auth_bp.route('/check-auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        return jsonify({
            "authenticated": True,
            "user": {
                "id": session['user_id'],
                "username": session['username']
            }
        })
    else:
        return jsonify({"authenticated": False}) 