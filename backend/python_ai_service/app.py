import os
import sys
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

# Now import the routes
from python_ai_service.routes.flashcard_routes import flashcard_bp
from python_ai_service.routes.generation_routes import generation_bp
from python_ai_service.routes.auth_routes import auth_bp
from python_ai_service.routes.profile_routes import profile_bp
from python_ai_service.routes.progress_routes import progress_bp
from python_ai_service.db.database import (
    create_users_table, 
    add_user_id_to_sets, 
    add_profile_columns_to_users,
    create_study_progress_table
)

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'a_default_secret_key')

# Configure session cookie settings for cross-origin requests
app.config.update(
    SESSION_COOKIE_SAMESITE='None',
    SESSION_COOKIE_SECURE=False,  # Use False for HTTP in development
    SESSION_COOKIE_HTTPONLY=True
)

# Initialize CORS with support for credentials
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

# Register blueprints
app.register_blueprint(flashcard_bp)
app.register_blueprint(generation_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(progress_bp)

# Add a simple test endpoint
@app.route('/test', methods=['GET', 'POST'])
def test_endpoint():
    print(f"Test endpoint called with method: {request.method}")
    if request.method == 'POST':
        print(f"POST data: {request.get_json()}")
    return jsonify({"message": "Test endpoint working!", "method": request.method})

# Initialize database tables
create_users_table()
add_user_id_to_sets()
add_profile_columns_to_users()
create_study_progress_table()

if __name__ == '__main__':
    print("Loading environment variables...")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Python path: {sys.path}")
    print(f"ANTHROPIC_API_KEY exists: {bool(os.getenv('ANTHROPIC_API_KEY'))}")
    print(f"DB_HOST exists: {bool(os.getenv('DB_HOST'))}")
    print(f"DB_NAME exists: {bool(os.getenv('DB_NAME'))}")
    print(f"DB_USER exists: {bool(os.getenv('DB_USER'))}")
    print(f"DB_PASSWORD exists: {bool(os.getenv('DB_PASSWORD'))}")
    print(f"SECRET_KEY exists: {bool(os.getenv('SECRET_KEY'))}")
    
    # Run on port 5001 to match the TypeScript server's expectations
    app.run(debug=True, host='0.0.0.0', port=5001)