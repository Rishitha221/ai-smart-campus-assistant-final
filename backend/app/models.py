from datetime import datetime
import uuid
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize db instance
db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')  # 'student' or 'admin'
    full_name = db.Column(db.String(100), nullable=True)
    department = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    complaints = db.relationship('Complaint', backref='student', lazy=True, cascade='all, delete-orphan')
    chats = db.relationship('ChatHistory', backref='student', lazy=True, cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
        
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'full_name': self.full_name,
            'department': self.department,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class CampusInfo(db.Model):
    __tablename__ = 'campus_info'
    
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False, index=True)  # 'courses', 'fees', 'exams', etc.
    question_keywords = db.Column(db.String(255), nullable=False)  # comma-separated matching terms
    answer_content = db.Column(db.Text, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'question_keywords': [kw.strip() for kw in self.question_keywords.split(',') if kw.strip()],
            'answer_content': self.answer_content
        }


class Complaint(db.Model):
    __tablename__ = 'complaints'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: f"CMP-{uuid.uuid4().hex[:8].upper()}")
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    image_path = db.Column(db.String(255), nullable=True)  # Cloudinary URL or local static path
    predicted_category = db.Column(db.String(50), nullable=True)  # AI Image Classifier category
    confidence_score = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='Pending')  # 'Pending', 'In Progress', 'Resolved'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    history = db.relationship('ComplaintStatusHistory', backref='complaint', lazy=True, cascade='all, delete-orphan', order_by='ComplaintStatusHistory.updated_at.desc()')
    notifications = db.relationship('Notification', backref='complaint', lazy=True, cascade='all, delete-orphan')
    upvotes = db.relationship('ComplaintUpvote', backref='complaint_ref', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.full_name if self.student else None,
            'student_email': self.student.email if self.student else None,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'image_path': self.image_path,
            'predicted_category': self.predicted_category,
            'confidence_score': self.confidence_score,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'history': [h.to_dict() for h in self.history],
            'upvote_count': len(self.upvotes)
        }


class ComplaintStatusHistory(db.Model):
    __tablename__ = 'complaint_status_history'
    
    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.String(36), db.ForeignKey('complaints.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    remarks = db.Column(db.Text, nullable=True)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to know who made the update
    updater = db.relationship('User', foreign_keys=[updated_by])

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'status': self.status,
            'remarks': self.remarks,
            'updated_by': self.updated_by,
            'updated_by_name': self.updater.full_name if self.updater else 'System',
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class ChatHistory(db.Model):
    __tablename__ = 'chat_history'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user_message = db.Column(db.Text, nullable=False)
    bot_response = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'user_message': self.user_message,
            'bot_response': self.bot_response,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }


class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    complaint_id = db.Column(db.String(36), db.ForeignKey('complaints.id', ondelete='CASCADE'), nullable=True)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'complaint_id': self.complaint_id,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class LostAndFoundItem(db.Model):
    __tablename__ = 'lost_and_found'
    
    id = db.Column(db.Integer, primary_key=True)
    item_type = db.Column(db.String(20), nullable=False) # 'lost' or 'found'
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    ai_category = db.Column(db.String(50), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Active') # Active, Claimed, Resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('lost_found_items', lazy=True, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'item_type': self.item_type,
            'title': self.title,
            'description': self.description,
            'image_url': self.image_url,
            'ai_category': self.ai_category,
            'user_id': self.user_id,
            'user_name': self.user.full_name if self.user else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ComplaintUpvote(db.Model):
    __tablename__ = 'complaint_upvotes'
    
    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.String(36), db.ForeignKey('complaints.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('complaint_id', 'user_id', name='_complaint_user_uc'),)

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Announcement(db.Model):
    __tablename__ = 'announcements'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    author = db.relationship('User', backref=db.backref('announcements', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'author_id': self.author_id,
            'author_name': self.author.full_name if self.author else 'System',
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Marks(db.Model):
    __tablename__ = 'marks'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    semester = db.Column(db.String(20), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    marks_obtained = db.Column(db.Float, nullable=False)
    max_marks = db.Column(db.Float, nullable=False, default=100.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('User', backref=db.backref('marks', lazy=True, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'semester': self.semester,
            'subject': self.subject,
            'marks_obtained': self.marks_obtained,
            'max_marks': self.max_marks,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Attendance(db.Model):
    __tablename__ = 'attendance'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    semester = db.Column(db.String(20), nullable=False)
    total_classes = db.Column(db.Integer, nullable=False, default=0)
    attended_classes = db.Column(db.Integer, nullable=False, default=0)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student = db.relationship('User', backref=db.backref('attendance_records', lazy=True, cascade='all, delete-orphan'))

    @property
    def percentage(self):
        if self.total_classes == 0:
            return 0.0
        return round((self.attended_classes / self.total_classes) * 100, 2)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'semester': self.semester,
            'total_classes': self.total_classes,
            'attended_classes': self.attended_classes,
            'percentage': self.percentage,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
