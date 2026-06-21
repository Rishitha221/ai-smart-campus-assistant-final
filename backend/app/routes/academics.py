from flask import Blueprint, request, jsonify
from app.models import db, Marks, Attendance, User
from app.utils import token_required

academics_bp = Blueprint('academics', __name__)

@academics_bp.route('/marks', methods=['GET'])
@token_required
def get_my_marks(current_user):
    if current_user.role == 'admin':
        # Admin can view anyone's marks via a query param, or all marks
        student_id = request.args.get('student_id')
        if student_id:
            marks = Marks.query.filter_by(student_id=student_id).all()
        else:
            marks = Marks.query.all()
    else:
        marks = Marks.query.filter_by(student_id=current_user.id).all()
        
    return jsonify({'marks': [m.to_dict() for m in marks]}), 200

@academics_bp.route('/marks', methods=['POST'])
@token_required
def add_marks(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403

    data = request.get_json()
    student_id = data.get('student_id')
    semester = data.get('semester')
    subject = data.get('subject')
    marks_obtained = data.get('marks_obtained')
    max_marks = data.get('max_marks', 100.0)

    if not all([student_id, semester, subject, marks_obtained]):
        return jsonify({'message': 'Missing required fields'}), 400

    new_marks = Marks(
        student_id=student_id,
        semester=semester,
        subject=subject,
        marks_obtained=float(marks_obtained),
        max_marks=float(max_marks)
    )
    db.session.add(new_marks)
    db.session.commit()

    return jsonify({'message': 'Marks added successfully', 'mark': new_marks.to_dict()}), 201

@academics_bp.route('/attendance', methods=['GET'])
@token_required
def get_my_attendance(current_user):
    if current_user.role == 'admin':
        student_id = request.args.get('student_id')
        if student_id:
            attendance = Attendance.query.filter_by(student_id=student_id).all()
        else:
            attendance = Attendance.query.all()
    else:
        attendance = Attendance.query.filter_by(student_id=current_user.id).all()
        
    return jsonify({'attendance': [a.to_dict() for a in attendance]}), 200

@academics_bp.route('/attendance', methods=['POST'])
@token_required
def update_attendance(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403

    data = request.get_json()
    student_id = data.get('student_id')
    semester = data.get('semester')
    total_classes = data.get('total_classes')
    attended_classes = data.get('attended_classes')

    if not all([student_id, semester, total_classes is not None, attended_classes is not None]):
        return jsonify({'message': 'Missing required fields'}), 400

    record = Attendance.query.filter_by(student_id=student_id, semester=semester).first()
    
    if record:
        record.total_classes = int(total_classes)
        record.attended_classes = int(attended_classes)
    else:
        record = Attendance(
            student_id=student_id,
            semester=semester,
            total_classes=int(total_classes),
            attended_classes=int(attended_classes)
        )
        db.session.add(record)
        
    db.session.commit()

    return jsonify({'message': 'Attendance updated successfully', 'attendance': record.to_dict()}), 201

@academics_bp.route('/students', methods=['GET'])
@token_required
def get_students(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Admin access required'}), 403
        
    students = User.query.filter_by(role='student').all()
    return jsonify({'students': [{'id': s.id, 'name': s.full_name, 'username': s.username} for s in students]}), 200
