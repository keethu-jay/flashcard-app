#!/usr/bin/env python3
"""
Registration Test Script
Run this to test the registration endpoint directly.
"""

import requests
import json
import time

def test_registration():
    """Test the registration endpoint directly."""
    print("=== Registration Test ===\n")
    
    # Test data
    test_user = {
        "username": f"testuser_{int(time.time())}",
        "email": f"test{int(time.time())}@example.com",
        "password": "testpassword123"
    }
    
    print(f"Testing registration with:")
    print(f"  Username: {test_user['username']}")
    print(f"  Email: {test_user['email']}")
    print(f"  Password: {test_user['password']}")
    print()
    
    try:
        # Test registration
        print("Sending registration request...")
        response = requests.post(
            "http://localhost:5001/register",
            json=test_user,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            print(f"Response data: {json.dumps(response_data, indent=2)}")
        except:
            print(f"Response text: {response.text}")
        
        if response.status_code == 200:
            print("\n✅ Registration successful!")
            
            # Test login with the same credentials
            print("\nTesting login with the same credentials...")
            login_response = requests.post(
                "http://localhost:5001/login",
                json={
                    "username": test_user["username"],
                    "password": test_user["password"]
                },
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            print(f"Login response status: {login_response.status_code}")
            try:
                login_data = login_response.json()
                print(f"Login response data: {json.dumps(login_data, indent=2)}")
            except:
                print(f"Login response text: {login_response.text}")
                
        else:
            print(f"\n❌ Registration failed with status {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error: Make sure the Python server is running on port 5001")
    except requests.exceptions.Timeout:
        print("❌ Request timeout: Server took too long to respond")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_registration() 