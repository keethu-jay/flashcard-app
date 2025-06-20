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

def create_users_table():
    """Create users table if it doesn't exist"""
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()
            print("Users table created successfully")
        except Exception as e:
            print(f"Error creating users table: {e}")
        finally:
            cur.close()
            conn.close()

def add_user_id_to_sets():
    """Add user_id column to sets table if it doesn't exist"""
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()
            # Check if user_id column exists
            cur.execute('''
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'sets' AND column_name = 'user_id'
            ''')
            if not cur.fetchone():
                cur.execute('ALTER TABLE sets ADD COLUMN user_id INTEGER REFERENCES users(id)')
                conn.commit()
                print("Added user_id column to sets table")
        except Exception as e:
            print(f"Error adding user_id to sets: {e}")
        finally:
            cur.close()
            conn.close() 