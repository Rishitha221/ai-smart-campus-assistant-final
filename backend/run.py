import os
import pymysql
from urllib.parse import urlparse
from app import create_app
from app.models import db
from app.services.db_service import seed_database

app = create_app()

def init_db():
    """
    Checks if the MySQL database exists, creates it if not,
    generates all tables, and seeds the database.
    """
    with app.app_context():
        db_url = app.config['SQLALCHEMY_DATABASE_URI']
        
        # Auto-create MySQL database if using PyMySQL URL
        if db_url.startswith('mysql+pymysql://'):
            parsed = urlparse(db_url)
            db_name = parsed.path.lstrip('/')
            
            user = parsed.username
            password = parsed.password or ''
            host = parsed.hostname
            port = parsed.port or 3306
            
            try:
                # Connect to MySQL server (without specifying DB name)
                conn = pymysql.connect(
                    host=host,
                    user=user,
                    password=password,
                    port=port
                )
                cursor = conn.cursor()
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
                conn.commit()
                cursor.close()
                conn.close()
                print(f"[Database Init] Database '{db_name}' checked/created successfully.")
            except Exception as e:
                print(f"[Database Init Warning] Could not auto-create database '{db_name}': {e}")
                print("Make sure the database exists, or verify your MySQL credentials in backend/.env")
                
        # Initialize tables
        try:
            db.create_all()
            print("[Database Init] Database tables initialized.")
            # Seed mock data
            seed_database()
        except Exception as e:
            print(f"[Database Init Error] SQLAlchemy failed to create tables: {e}")
            print("Verify that MySQL is running and your DATABASE_URL in backend/.env is correct.")

if __name__ == '__main__':
    # Initialize DB before running
    init_db()
    
    # Run the Flask development server
    port = int(os.environ.get('PORT', 5000))
    # Threaded is true for handling multiple concurrent requests (needed for SSE stream)
    app.run(host='0.0.0.0', port=port, debug=True, threaded=True)
