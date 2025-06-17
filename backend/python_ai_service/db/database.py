import os
import psycopg2
from dotenv import load_dotenv

def get_db_connection():
    """Create a connection to the PostgreSQL database."""
    try:
        # Load environment variables
        load_dotenv()
        
        # Get database connection parameters from environment variables
        db_host = os.getenv('DB_HOST', 'localhost')
        db_name = os.getenv('DB_NAME', 'flashcards')
        db_user = os.getenv('DB_USER', 'postgres')
        db_password = os.getenv('DB_PASSWORD', '')
        
        # Create connection
        conn = psycopg2.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_password
        )
        
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None 