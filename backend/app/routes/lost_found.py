from flask import Blueprint, request, jsonify
from app.models import db, LostAndFoundItem
from app.utils import token_required, allowed_file
from app.services.cloudinary_service import upload_image
from app.services.ai_service import classify_issue_image

lost_found_bp = Blueprint('lost_found', __name__)

@lost_found_bp.route('/', methods=['GET'])
def get_items():
    items = LostAndFoundItem.query.order_by(LostAndFoundItem.created_at.desc()).all()
    return jsonify({'items': [item.to_dict() for item in items]}), 200

@lost_found_bp.route('/submit', methods=['POST'])
@token_required
def submit_item(current_user):
    item_type = request.form.get('item_type', 'lost').strip()
    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    
    if not title or not description:
        return jsonify({'message': 'Title and description are required.'}), 400

    image_url = None
    ai_category = "Uncategorized"
    
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '' and allowed_file(file.filename):
            image_url = upload_image(file)
            # Try to classify the image
            if image_url:
                try:
                    category, _ = classify_issue_image(image_url)
                    if category:
                        ai_category = category
                except Exception as e:
                    print(f"AI Classification error: {e}")

    new_item = LostAndFoundItem(
        item_type=item_type,
        title=title,
        description=description,
        image_url=image_url,
        ai_category=ai_category,
        user_id=current_user.id
    )
    
    db.session.add(new_item)
    db.session.commit()
    
    return jsonify({
        'message': f'{item_type.capitalize()} item posted successfully!',
        'item': new_item.to_dict()
    }), 201

@lost_found_bp.route('/<int:item_id>/status', methods=['PUT'])
@token_required
def update_status(current_user, item_id):
    item = LostAndFoundItem.query.get_or_404(item_id)
    
    # Only the user who posted it or an admin can update the status
    if current_user.role != 'admin' and item.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    new_status = data.get('status')
    
    if not new_status:
        return jsonify({'message': 'Status is required.'}), 400

    item.status = new_status
    db.session.commit()
    
    return jsonify({'message': 'Status updated successfully', 'item': item.to_dict()}), 200
