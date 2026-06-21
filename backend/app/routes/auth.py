from flask import Blueprint, request, jsonify
from app.models import db, User
from app.utils import generate_token, token_required
import re

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Endpoint for user registration. Default role is 'student'.
    """
    data = request.get_json() or {}
    
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    department = data.get('department', '').strip()
    role = data.get('role', 'student').strip()
    
    # 1. Validation
    if not username or not email or not password:
        return jsonify({'message': 'Username, email, and password are required.'}), 400
        
    if role not in ['student', 'admin']:
        role = 'student'
        
    # Validating email format
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        return jsonify({'message': 'Invalid email format.'}), 400
        
    if len(password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters long.'}), 400
        
    # Check if user already exists
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists.'}), 409
        
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists.'}), 409
        
    # 2. Creation
    try:
        new_user = User(
            username=username,
            email=email,
            role=role,
            full_name=full_name or username.capitalize(),
            department=department or None
        )
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'Registration successful. You can now log in.',
            'user': new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Endpoint for user login. Returns JWT token on success.
    """
    data = request.get_json() or {}
    
    identifier = data.get('username', '').strip()  # Can be username or email
    password = data.get('password', '')
    
    if not identifier or not password:
        return jsonify({'message': 'Username/Email and password are required.'}), 400
        
    # Find user by username or email
    user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
    
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid username/email or password.'}), 401
        
    # Generate Token
    token = generate_token(user.id, user.role)
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'full_name': user.full_name,
            'department': user.department
        },
        'message': 'Login successful.'
    }), 200


@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """
    Protected route to retrieve current user profile.
    """
    return jsonify(current_user.to_dict()), 200


@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """
    Protected route to update user profile.
    """
    data = request.get_json() or {}
    
    full_name = data.get('full_name', '').strip()
    department = data.get('department', '').strip()
    new_password = data.get('password', '')
    
    try:
        if full_name:
            current_user.full_name = full_name
        if department:
            current_user.department = department
        if new_password:
            if len(new_password) < 6:
                return jsonify({'message': 'Password must be at least 6 characters long.'}), 400
            current_user.set_password(new_password)
            
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully.',
            'user': current_user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Server error: {str(e)}'}), 500
