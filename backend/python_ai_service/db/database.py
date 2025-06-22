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
        db_name = os.getenv('DB_NAME', 'flashcard_app_db')
        db_user = os.getenv('DB_USER', 'postgres')
        db_password = os.getenv('DB_PASSWORD', '')
        
        print(f"Attempting to connect to database: {db_name} on {db_host} as {db_user}")
        
        # Create connection
        conn = psycopg2.connect(
            host=db_host,
            database=db_name,
            user=db_user,
            password=db_password
        )
        
        print("Database connection successful!")
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        print(f"Database config - Host: {os.getenv('DB_HOST', 'localhost')}, Name: {os.getenv('DB_NAME', 'flashcard_app_db')}, User: {os.getenv('DB_USER', 'postgres')}")
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

def add_profile_columns_to_users():
    """Add bio and profile_image_url columns to users table if they don't exist"""
    conn = get_db_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                # Check for bio column
                cur.execute("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'bio'
                """)
                if not cur.fetchone():
                    cur.execute('ALTER TABLE users ADD COLUMN bio TEXT')
                    print("Added bio column to users table")

                # Check for profile_image_url column
                cur.execute("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'profile_image_url'
                """)
                if not cur.fetchone():
                    cur.execute("ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(255)")
                    print("Added profile_image_url column to users table")
                
                conn.commit()
        except Exception as e:
            print(f"Error adding profile columns to users: {e}")
        finally:
            conn.close()

def create_study_progress_table():
    """Create study_progress table to track user's learning progress"""
    conn = get_db_connection()
    if conn:
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS study_progress (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        card_id INTEGER NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
                        correct_count INTEGER NOT NULL DEFAULT 0,
                        last_correct_at TIMESTAMP,
                        UNIQUE(user_id, card_id)
                    )
                """)
                conn.commit()
                print("study_progress table checked/created successfully.")
        except Exception as e:
            print(f"Error creating study_progress table: {e}")
        finally:
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