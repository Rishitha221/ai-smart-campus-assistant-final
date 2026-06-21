import jwt
import datetime
from functools import wraps
from flask import request, jsonify, current_app
from app.models import User

def generate_token(user_id, role, expiry_days=7):
    """
    Generates a secure JWT token for authenticated users.
    """
    try:
        payload = {
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=expiry_days),
            'iat': datetime.datetime.utcnow(),
            'sub': user_id,
            'role': role
        }
        # For PyJWT v2.0+, decode is no longer needed since encode returns a string
        token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
        if isinstance(token, bytes):
            return token.decode('utf-8')
        return token
    except Exception as e:
        return str(e)


def token_required(f):
    """
    Decorator to protect routes with JWT authentication.
    Passes current_user to the wrapped route handler.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                
        if not token:
            return jsonify({'message': 'Access denied. Token is missing!'}), 401
            
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(payload['sub'])
            if not current_user:
                return jsonify({'message': 'Invalid token. User does not exist.'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired. Please log in again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token. Please authenticate.'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated


def admin_required(f):
    """
    Decorator to protect routes requiring administrator privileges.
    Passes current_user to the wrapped route handler.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                
        if not token:
            return jsonify({'message': 'Access denied. Token is missing!'}), 401
            
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            if payload.get('role') != 'admin':
                return jsonify({'message': 'Unauthorized. Admin access required!'}), 403
            
            current_user = User.query.get(payload['sub'])
            if not current_user:
                return jsonify({'message': 'Invalid token. User does not exist.'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired. Please log in again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token. Please authenticate.'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated


def allowed_file(filename):
    """
    Verifies that the uploaded file has a valid image extension.
    """
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
