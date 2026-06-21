import os
from dotenv import load_dotenv

# Base directory of the backend project
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Load environment variables from .env
load_dotenv(os.path.join(BASE_DIR, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'ai_smart_campus_jwt_secret_key_2026')
    
    # SQLAlchemy configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'mysql+pymysql://root:@localhost:3306/smart_campus')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Hugging Face Configuration
    HF_API_TOKEN = os.environ.get('HF_API_TOKEN', '')
    
    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', '')
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY', '')
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', '')
    
    # SMTP Email Configuration
    SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
    SMTP_USERNAME = os.environ.get('SMTP_USERNAME', '')
    SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
    SMTP_FROM_EMAIL = os.environ.get('SMTP_FROM_EMAIL', '')
    
    # Local Static File Upload Fallback
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB limit
