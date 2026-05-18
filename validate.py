#!/usr/bin/env python
"""
Validation script to check if the Research Agent system is properly configured
"""

import os
import sys
import json
from pathlib import Path

def check_python_packages():
    """Check if required Python packages are installed"""
    print("\n📦 Checking Python packages...")
    required_packages = [
        'flask', 'flask_cors', 'dotenv', 'tavily', 'openai',
        'chromadb', 'sentence_transformers', 'google.generativeai'
    ]
    
    missing = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"  ✓ {package}")
        except ImportError:
            print(f"  ✗ {package} - MISSING")
            missing.append(package)
    
    return len(missing) == 0

def check_env_file():
    """Check if .env file exists and has required keys"""
    print("\n🔑 Checking environment configuration...")
    
    if not os.path.exists('.env'):
        print("  ✗ .env file not found")
        return False
    
    env_keys = ['OPENROUTER_API_KEY', 'TAVILY_API_KEY']
    env_content = {}
    
    with open('.env', 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                env_content[key] = value
    
    all_present = True
    for key in env_keys:
        if key in env_content and env_content[key]:
            print(f"  ✓ {key}")
        else:
            print(f"  ✗ {key} - NOT SET or EMPTY")
            all_present = False
    
    return all_present

def check_project_structure():
    """Check if project structure is correct"""
    print("\n📁 Checking project structure...")
    
    required_files = [
        'app.py',
        'main.py',
        'memory.py',
        'requirements.txt',
        'frontend/server.ts',
        'frontend/package.json',
        'frontend/src/App.tsx'
    ]
    
    all_present = True
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"  ✓ {file_path}")
        else:
            print(f"  ✗ {file_path} - MISSING")
            all_present = False
    
    return all_present

def check_backend_api():
    """Check if backend API is responding"""
    print("\n🔗 Checking backend connectivity...")
    
    try:
        import requests
        response = requests.get('http://localhost:5000/api/health', timeout=2)
        if response.status_code == 200:
            print("  ✓ Backend API is responding")
            return True
        else:
            print(f"  ✗ Backend API returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("  ⚠ Backend not running (this is OK during initial check)")
        return None
    except Exception as e:
        print(f"  ✗ Error checking backend: {e}")
        return False

def main():
    print("=" * 50)
    print("Research Agent - System Validation")
    print("=" * 50)
    
    # Change to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    results = {
        'packages': check_python_packages(),
        'env': check_env_file(),
        'structure': check_project_structure(),
        'backend': check_backend_api()
    }
    
    print("\n" + "=" * 50)
    print("Validation Summary")
    print("=" * 50)
    
    for check, result in results.items():
        if result is None:
            status = "⚠ N/A"
        elif result:
            status = "✓ PASS"
        else:
            status = "✗ FAIL"
        print(f"{check.upper()}: {status}")
    
    # Determine overall status
    critical_checks = ['packages', 'structure', 'env']
    critical_passed = all(results.get(check, False) for check in critical_checks)
    
    print("\n" + "=" * 50)
    if critical_passed:
        print("✓ System is ready to run!")
        print("\nNext steps:")
        print("1. Ensure all API keys are set in .env")
        print("2. Run: START.bat (Windows) or manually start backend and frontend")
        print("3. Access: http://localhost:3000")
    else:
        print("✗ System validation failed!")
        print("\nPlease fix the issues above and try again.")
        sys.exit(1)
    
    print("=" * 50)

if __name__ == '__main__':
    main()
