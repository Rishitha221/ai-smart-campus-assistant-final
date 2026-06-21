from flask import Blueprint, request, jsonify
from app.models import db, ChatHistory
from app.utils import token_required
from app.services.ai_service import get_chatbot_response

chatbot_bp = Blueprint('chatbot', __name__)

@chatbot_bp.route('/query', methods=['POST'])
@token_required
def chatbot_query(current_user):
    """
    Submits a chatbot query, gets an AI response, saves to database, and returns it.
    """
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    
    if not message:
        return jsonify({'message': 'Query message cannot be empty.'}), 400
        
    try:
        # Fetch last 5 chat messages for context
        recent_chats = ChatHistory.query.filter_by(student_id=current_user.id)\
            .order_by(ChatHistory.timestamp.asc())\
            .limit(5).all()
            
        # Call AI service (which uses Hugging Face or Local rule fallback)
        bot_response = get_chatbot_response(message, current_user.id, recent_chats)
        
        # Save to database
        new_chat = ChatHistory(
            student_id=current_user.id,
            user_message=message,
            bot_response=bot_response
        )
        db.session.add(new_chat)
        db.session.commit()
        
        return jsonify({
            'chat': new_chat.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@chatbot_bp.route('/history', methods=['GET'])
@token_required
def get_chat_history(current_user):
    """
    Retrieves all chatbot history for the authenticated student.
    """
    try:
        chats = ChatHistory.query.filter_by(student_id=current_user.id)\
            .order_by(ChatHistory.timestamp.asc())\
            .all()
            
        return jsonify({
            'history': [c.to_dict() for c in chats]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500
