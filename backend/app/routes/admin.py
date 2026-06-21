import json
import queue
from flask import Blueprint, request, jsonify, Response, send_file
from app.models import db, Complaint, ComplaintStatusHistory, User, ChatHistory, Notification
from app.utils import admin_required, token_required
from app.services.email_service import send_status_update_email
import pandas as pd
import io
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

# Real-time SSE subscriber queues list
sse_listeners = []

def broadcast_sse_notification(user_id, message, complaint_id=None):
    """
    Pushes a notification payload to all active SSE listener queues.
    """
    payload = {
        'user_id': user_id,
        'message': message,
        'complaint_id': complaint_id,
        'timestamp': datetime.utcnow().isoformat()
    }
    # Thread-safe dispatch
    for listener_queue in list(sse_listeners):
        try:
            listener_queue.put(payload)
        except Exception as e:
            print(f"[SSE Broadcast Error] Failed to push to queue: {e}")


@admin_bp.route('/notifications/stream', methods=['GET'])
def sse_notification_stream():
    """
    Server-Sent Events endpoint. Clients connect to receive live toasts.
    """
    def event_generator():
        q = queue.Queue()
        sse_listeners.append(q)
        print(f"[SSE Connected] Active listeners: {len(sse_listeners)}")
        try:
            while True:
                # Wait blocks until data is available in the queue
                notification = q.get()
                yield f"data: {json.dumps(notification)}\n\n"
        except GeneratorExit:
            pass
        finally:
            if q in sse_listeners:
                sse_listeners.remove(q)
            print(f"[SSE Disconnected] Active listeners: {len(sse_listeners)}")
            
    return Response(event_generator(), mimetype='text/event-stream')


@admin_bp.route('/complaints', methods=['GET'])
@admin_required
def get_all_complaints(current_user):
    """
    Retrieves all complaints with advanced searching, filtering, and sorting.
    """
    status = request.args.get('status', '').strip()
    category = request.args.get('category', '').strip()
    search = request.args.get('search', '').strip()
    
    query = Complaint.query
    
    # Apply Filters
    if status:
        query = query.filter(Complaint.status == status)
    if category:
        query = query.filter(Complaint.predicted_category == category)
    if search:
        query = query.join(User).filter(
            (Complaint.title.like(f"%{search}%")) |
            (Complaint.description.like(f"%{search}%")) |
            (Complaint.id.like(f"%{search}%")) |
            (User.full_name.like(f"%{search}%"))
        )
        
    complaints = query.order_by(Complaint.created_at.desc()).all()
    
    return jsonify({
        'complaints': [c.to_dict() for c in complaints]
    }), 200


@admin_bp.route('/complaints/<complaint_id>/status', methods=['PUT'])
@admin_required
def update_complaint_status(current_user, complaint_id):
    """
    Updates a complaint's status, appends to logs, sends emails, and broadcasts SSE.
    """
    data = request.get_json() or {}
    new_status = data.get('status', '').strip()
    remarks = data.get('remarks', '').strip()
    
    if new_status not in ['Pending', 'In Progress', 'Resolved']:
        return jsonify({'message': 'Invalid status value.'}), 400
        
    try:
        complaint = Complaint.query.get(complaint_id)
        if not complaint:
            return jsonify({'message': 'Complaint not found.'}), 404
            
        old_status = complaint.status
        if old_status == new_status:
            return jsonify({'message': f'Complaint status is already {new_status}.'}), 400
            
        # Update details
        complaint.status = new_status
        
        # Append status history
        history_entry = ComplaintStatusHistory(
            complaint_id=complaint.id,
            status=new_status,
            remarks=remarks or f"Status changed to {new_status}.",
            updated_by=current_user.id
        )
        db.session.add(history_entry)
        
        # Create user notification in DB
        notification_msg = f"Your complaint '{complaint.title}' ({complaint.id}) has been updated from {old_status} to {new_status}."
        new_notification = Notification(
            user_id=complaint.student_id,
            complaint_id=complaint.id,
            message=notification_msg
        )
        db.session.add(new_notification)
        
        db.session.commit()
        
        # 1. Trigger SSE broadcast
        broadcast_sse_notification(complaint.student_id, notification_msg, complaint.id)
        
        # 2. Trigger Email notification (non-blocking simulation)
        if complaint.student:
            send_status_update_email(
                student_email=complaint.student.email,
                student_name=complaint.student.full_name,
                complaint_id=complaint.id,
                complaint_title=complaint.title,
                old_status=old_status,
                new_status=new_status,
                remarks=remarks
            )
            
        return jsonify({
            'message': 'Status updated successfully.',
            'complaint': complaint.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@admin_bp.route('/analytics', methods=['GET'])
@admin_required
def get_analytics(current_user):
    """
    Computes visual analytics metrics: counts, category breakdowns, monthly trends, and bot usage.
    """
    try:
        total = Complaint.query.count()
        pending = Complaint.query.filter_by(status='Pending').count()
        in_progress = Complaint.query.filter_by(status='In Progress').count()
        resolved = Complaint.query.filter_by(status='Resolved').count()
        
        # Category breakdown
        categories_breakdown = {}
        for cat in ["Furniture Damage", "Cleanliness Issue", "Electrical Issue", "Water Leakage", "Maintenance Issue"]:
            categories_breakdown[cat] = Complaint.query.filter_by(predicted_category=cat).count()
            
        # Monthly trends (last 6 months)
        all_complaints = Complaint.query.order_by(Complaint.created_at.asc()).all()
        monthly_trends = {}
        for c in all_complaints:
            month_name = c.created_at.strftime('%b %Y')  # e.g., "Jun 2026"
            monthly_trends[month_name] = monthly_trends.get(month_name, 0) + 1
            
        # Chatbot analytics
        total_chats = ChatHistory.query.count()
        unique_chat_users = db.session.query(ChatHistory.student_id).distinct().count()
        avg_chats = round(total_chats / unique_chat_users, 1) if unique_chat_users > 0 else 0
        
        # Format monthly trends list
        trend_labels = list(monthly_trends.keys())[-6:]  # last 6 active months
        trend_values = [monthly_trends[m] for m in trend_labels]
        
        return jsonify({
            'counts': {
                'total': total,
                'pending': pending,
                'inProgress': in_progress,
                'resolved': resolved
            },
            'categories': categories_breakdown,
            'trends': {
                'labels': trend_labels,
                'values': trend_values
            },
            'chatbot': {
                'totalConversations': total_chats,
                'activeUsers': unique_chat_users,
                'averageMessagesPerUser': avg_chats
            }
        }), 200
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@admin_bp.route('/complaints/export', methods=['GET'])
@admin_required
def export_complaints_excel(current_user):
    """
    Generates and exports filtered complaints as an Excel spreadsheet.
    """
    status = request.args.get('status', '').strip()
    category = request.args.get('category', '').strip()
    
    try:
        query = Complaint.query
        if status:
            query = query.filter(Complaint.status == status)
        if category:
            query = query.filter(Complaint.predicted_category == category)
            
        complaints = query.order_by(Complaint.created_at.desc()).all()
        
        # Construct dataset for pandas
        data = []
        for c in complaints:
            data.append({
                'Complaint ID': c.id,
                'Student Name': c.student.full_name if c.student else 'N/A',
                'Student Email': c.student.email if c.student else 'N/A',
                'Department': c.student.department if c.student else 'N/A',
                'Title': c.title,
                'Description': c.description,
                'Location': c.location,
                'AI Category': c.predicted_category or 'Unclassified',
                'Confidence': f"{c.confidence_score * 100:.1f}%" if c.confidence_score else 'N/A',
                'Status': c.status,
                'Date Submitted': c.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'Last Updated': c.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            })
            
        df = pd.DataFrame(data)
        
        # Write to memory buffer
        excel_buffer = io.BytesIO()
        with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Campus Complaints')
            
        excel_buffer.seek(0)
        
        return send_file(
            excel_buffer,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name=f"Campus_Complaints_Export_{datetime.now().strftime('%Y%m%d')}.xlsx"
        )
    except Exception as e:
        return jsonify({'message': f'Failed to export Excel: {str(e)}'}), 500


@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users_list(current_user):
    """
    Lists all registered users on the platform.
    """
    try:
        users = User.query.order_by(User.created_at.desc()).all()
        return jsonify({
            'users': [u.to_dict() for u in users]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@admin_required
def update_user_role(current_user, user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Prevent the primary admin from changing their own role
        if user.id == current_user.id:
            return jsonify({'message': 'You cannot change your own role.'}), 400

        data = request.get_json()
        new_role = data.get('role')
        if new_role not in ['admin', 'student']:
            return jsonify({'message': 'Invalid role specified.'}), 400

        user.role = new_role
        db.session.commit()
        return jsonify({'message': f'User role updated to {new_role}'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Server error: {str(e)}'}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(current_user, user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
            
        if user.id == current_user.id:
            return jsonify({'message': 'You cannot delete your own account.'}), 400

        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Server error: {str(e)}'}), 500



# --- USER NOTIFICATIONS ENDPOINTS (accessible by any logged in user) ---

@admin_bp.route('/notifications', methods=['GET'])
@token_required
def get_user_notifications(current_user):
    """
    Retrieves all notifications for the logged-in student or admin.
    """
    try:
        notifications = Notification.query.filter_by(user_id=current_user.id)\
            .order_by(Notification.created_at.desc())\
            .all()
            
        unread_count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
        
        return jsonify({
            'notifications': [n.to_dict() for n in notifications],
            'unreadCount': unread_count
        }), 200
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@admin_bp.route('/notifications/<int:notification_id>/read', methods=['PUT'])
@token_required
def mark_notification_read(current_user, notification_id):
    """
    Marks a specific notification as read.
    """
    try:
        notification = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first()
        if not notification:
            return jsonify({'message': 'Notification not found.'}), 404
            
        notification.is_read = True
        db.session.commit()
        
        return jsonify({'message': 'Notification marked as read.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Server error: {str(e)}'}), 500
