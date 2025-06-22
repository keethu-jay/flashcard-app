#!/usr/bin/env python3
"""
Database Connection Test Script
Run this to verify your database connection is working properly.
"""

import os
import sys
from dotenv import load_dotenv

# Add the python_ai_service directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'python_ai_service'))

from python_ai_service.db.database import get_db_connection

def test_database_connection():
    """Test the database connection and print detailed information."""
    print("=== Database Connection Test ===\n")
    
    # Load environment variables
    load_dotenv(os.path.join(os.path.dirname(__file__), 'python_ai_service', '.env'))
    
    # Print environment variables (without sensitive data)
    print("Environment Variables:")
    print(f"  DB_HOST: {os.getenv('DB_HOST', 'localhost')}")
    print(f"  DB_NAME: {os.getenv('DB_NAME', 'flashcard_app_db')}")
    print(f"  DB_USER: {os.getenv('DB_USER', 'postgres')}")
    print(f"  DB_PASSWORD: {'*' * len(os.getenv('DB_PASSWORD', '')) if os.getenv('DB_PASSWORD') else 'Not set'}")
    print()
    
    # Test connection
    print("Testing database connection...")
    conn = get_db_connection()
    
    if conn:
        print("✅ Database connection successful!")
        
        try:
            cur = conn.cursor()
            
            # Test if tables exist
            print("\nChecking tables...")
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name IN ('users', 'sets', 'flashcards')
                ORDER BY table_name
            """)
            
            tables = cur.fetchall()
            existing_tables = [table[0] for table in tables]
            
            print("Existing tables:")
            for table in ['users', 'sets', 'flashcards']:
                status = "✅" if table in existing_tables else "❌"
                print(f"  {status} {table}")
            
            # Test user creation (without actually creating one)
            print("\nTesting user table structure...")
            cur.execute("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'users'
                ORDER BY ordinal_position
            """)
            
            columns = cur.fetchall()
            if columns:
                print("Users table columns:")
                for col in columns:
                    print(f"  - {col[0]} ({col[1]}, {'NULL' if col[2] == 'YES' else 'NOT NULL'})")
            else:
                print("❌ Users table not found or no columns")
            
            cur.close()
            conn.close()
            print("\n✅ Database test completed successfully!")
            
        except Exception as e:
            print(f"❌ Error testing database: {e}")
            conn.close()
    else:
        print("❌ Database connection failed!")
        print("\nTroubleshooting tips:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check your .env file has correct credentials")
        print("3. Verify the database 'flashcard_app_db' exists")
        print("4. Check if your database user has proper permissions")

if __name__ == "__main__":
    test_database_connection() 