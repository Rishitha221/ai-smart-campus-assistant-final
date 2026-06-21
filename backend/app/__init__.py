import os
from flask import Flask
from flask_cors import CORS
from app.models import db
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Configure CORS - allow React app to connect
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize database
    db.init_app(app)
    
    # Ensure local upload directories exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.chatbot import chatbot_bp
    from app.routes.complaints import complaints_bp
    from app.routes.admin import admin_bp
    from app.routes.lost_found import lost_found_bp
    from app.routes.announcements import announcements_bp
    from app.routes.academics import academics_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
    app.register_blueprint(complaints_bp, url_prefix='/api/complaints')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(lost_found_bp, url_prefix='/api/lost-found')
    app.register_blueprint(announcements_bp, url_prefix='/api/announcements')
    app.register_blueprint(academics_bp, url_prefix='/api/academics')
    
    # Simple check route
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'AI Smart Campus Assistant API is running'}, 200
        
    return app
