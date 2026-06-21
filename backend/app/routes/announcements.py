from flask import Blueprint, request, jsonify
from app.models import db, Announcement
from app.utils import token_required

announcements_bp = Blueprint('announcements', __name__)

@announcements_bp.route('/', methods=['GET'])
@token_required
def get_announcements(current_user):
    announcements = Announcement.query.order_by(Announcement.created_at.desc()).all()
    return jsonify({'announcements': [a.to_dict() for a in announcements]}), 200

@announcements_bp.route('/', methods=['POST'])
@token_required
def create_announcement(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403

    data = request.get_json()
    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    
    if not title or not content:
        return jsonify({'message': 'Title and content are required'}), 400

    announcement = Announcement(
        title=title,
        content=content,
        author_id=current_user.id
    )
    
    db.session.add(announcement)
    db.session.commit()
    
    return jsonify({
        'message': 'Announcement posted successfully!',
        'announcement': announcement.to_dict()
    }), 201

@announcements_bp.route('/<int:announcement_id>', methods=['DELETE'])
@token_required
def delete_announcement(current_user, announcement_id):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403

    announcement = Announcement.query.get_or_404(announcement_id)
    db.session.delete(announcement)
    db.session.commit()
    
    return jsonify({'message': 'Announcement deleted successfully'}), 200
