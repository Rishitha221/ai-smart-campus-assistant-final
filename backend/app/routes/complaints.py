import os
import io
import requests
from flask import Blueprint, request, jsonify, send_file, current_app
from app.models import db, Complaint, ComplaintStatusHistory
from app.utils import token_required, allowed_file
from app.services.cloudinary_service import upload_image
from app.services.ai_service import classify_issue_image

# ReportLab imports for PDF generation
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

complaints_bp = Blueprint('complaints', __name__)

@complaints_bp.route('/submit', methods=['POST'])
@token_required
def submit_complaint(current_user):
    """
    Submits a campus issue, uploads image, triggers AI classification, 
    and saves to database.
    """
    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    location = request.form.get('location', '').strip()
    
    if not title or not description or not location:
        return jsonify({'message': 'Title, description, and location are required.'}), 400
        
    image_url = None
    predicted_category = "Maintenance Issue"
    confidence = 1.0
    
    # Check if image uploaded
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '':
            if allowed_file(file.filename):
                # 1. Classify image using CLIP (needs file stream)
                try:
                    predicted_category, confidence = classify_issue_image(file)
                except Exception as e:
                    print(f"[Complaints API] Classification error: {e}")
                    predicted_category, confidence = "Maintenance Issue", 0.50
                
                # 2. Upload image to Cloudinary (or local)
                try:
                    image_url = upload_image(file)
                except Exception as e:
                    print(f"[Complaints API] Image upload error: {e}")
                    return jsonify({'message': 'Failed to save uploaded image.'}), 500
            else:
                return jsonify({'message': 'Invalid file format. Only images are allowed.'}), 400
                
    try:
        # Create complaint
        new_complaint = Complaint(
            student_id=current_user.id,
            title=title,
            description=description,
            location=location,
            image_path=image_url,
            predicted_category=predicted_category,
            confidence_score=confidence,
            status='Pending'
        )
        
        db.session.add(new_complaint)
        db.session.flush()  # Generates ID
        
        # Create initial status history
        initial_history = ComplaintStatusHistory(
            complaint_id=new_complaint.id,
            status='Pending',
            remarks='Complaint submitted by student.',
            updated_by=current_user.id
        )
        db.session.add(initial_history)
        db.session.commit()
        
        return jsonify({
            'message': 'Complaint submitted successfully.',
            'complaint': new_complaint.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@complaints_bp.route('/list', methods=['GET'])
@token_required
def list_student_complaints(current_user):
    """
    Lists all complaints submitted by the logged-in student.
    """
    try:
        complaints = Complaint.query.filter_by(student_id=current_user.id)\
            .order_by(Complaint.created_at.desc())\
            .all()
            
        return jsonify({
            'complaints': [c.to_dict() for c in complaints]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@complaints_bp.route('/community', methods=['GET'])
@token_required
def list_community_complaints(current_user):
    """
    Lists all complaints for the community feed.
    """
    try:
        complaints = Complaint.query.order_by(Complaint.created_at.desc()).all()
            
        return jsonify({
            'complaints': [c.to_dict() for c in complaints]
        }), 200
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@complaints_bp.route('/<complaint_id>/upvote', methods=['POST'])
@token_required
def toggle_upvote(current_user, complaint_id):
    from app.models import ComplaintUpvote
    
    complaint = Complaint.query.get_or_404(complaint_id)
    
    existing_upvote = ComplaintUpvote.query.filter_by(complaint_id=complaint_id, user_id=current_user.id).first()
    
    if existing_upvote:
        # Toggle off (remove upvote)
        db.session.delete(existing_upvote)
        db.session.commit()
        return jsonify({'message': 'Upvote removed', 'upvotes': len(complaint.upvotes)}), 200
    else:
        # Toggle on (add upvote)
        new_upvote = ComplaintUpvote(complaint_id=complaint_id, user_id=current_user.id)
        db.session.add(new_upvote)
        db.session.commit()
        return jsonify({'message': 'Upvoted successfully', 'upvotes': len(complaint.upvotes)}), 201


@complaints_bp.route('/<complaint_id>', methods=['GET'])
@token_required
def get_complaint_details(current_user, complaint_id):
    """
    Retrieves details for a specific complaint. 
    Verifies that students only access their own.
    """
    try:
        complaint = Complaint.query.get(complaint_id)
        if not complaint:
            return jsonify({'message': 'Complaint not found.'}), 404
            
        # Role-based restriction: students can only see their own complaints
        if current_user.role != 'admin' and complaint.student_id != current_user.id:
            return jsonify({'message': 'Unauthorized to view this complaint.'}), 403
            
        return jsonify({
            'complaint': complaint.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500


@complaints_bp.route('/<complaint_id>/pdf', methods=['GET'])
@token_required
def download_complaint_pdf(current_user, complaint_id):
    """
    Generates and returns a PDF report of a specific complaint.
    """
    try:
        complaint = Complaint.query.get(complaint_id)
        if not complaint:
            return jsonify({'message': 'Complaint not found.'}), 404
            
        # Security check
        if current_user.role != 'admin' and complaint.student_id != current_user.id:
            return jsonify({'message': 'Unauthorized to view this report.'}), 403
            
        # Create bytes buffer for PDF
        pdf_buffer = io.BytesIO()
        
        # Build ReportLab Document
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            textColor=colors.HexColor('#4F46E5'),
            spaceAfter=15
        )
        
        section_heading = ParagraphStyle(
            'SecHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=12,
            spaceAfter=6
        )
        
        normal_bold = ParagraphStyle(
            'NormalBold',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            textColor=colors.HexColor('#334155')
        )
        
        normal_val = ParagraphStyle(
            'NormalVal',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            textColor=colors.HexColor('#0F172A')
        )

        elements = []
        
        # 1. Header (Letterhead)
        header_data = [
            [Paragraph("<b>AI SMART CAMPUS ASSISTANT</b>", ParagraphStyle('H1', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=14, textColor=colors.HexColor('#4F46E5'))),
             Paragraph("Date Generated: " + complaint.created_at.strftime('%Y-%m-%d %H:%M:%S'), ParagraphStyle('R', parent=styles['Normal'], alignment=2))]
        ]
        header_table = Table(header_data, colWidths=[300, 240])
        header_table.setStyle(TableStyle([
            ('LINEBELOW', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
            ('PADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8)
        ]))
        elements.append(header_table)
        elements.append(Spacer(1, 15))
        
        # 2. Main Title
        elements.append(Paragraph(f"Complaint Report: {complaint.id}", title_style))
        elements.append(Spacer(1, 10))
        
        # 3. Info Table
        info_data = [
            [Paragraph("Title", normal_bold), Paragraph(complaint.title, normal_val)],
            [Paragraph("Location", normal_bold), Paragraph(complaint.location, normal_val)],
            [Paragraph("Status", normal_bold), Paragraph(f"<b>{complaint.status}</b>", ParagraphStyle('St', parent=normal_val, textColor=colors.HexColor('#059669') if complaint.status == 'Resolved' else colors.HexColor('#D97706')))],
            [Paragraph("Date Submitted", normal_bold), Paragraph(complaint.created_at.strftime('%Y-%m-%d %H:%M:%S'), normal_val)],
            [Paragraph("AI Category", normal_bold), Paragraph(f"{complaint.predicted_category or 'N/A'} (Confidence: {complaint.confidence_score*100:.1f}%)" if complaint.predicted_category else "Not Classified", normal_val)],
            [Paragraph("Submitted By", normal_bold), Paragraph(f"{complaint.student.full_name} ({complaint.student.email})", normal_val)],
            [Paragraph("Description", normal_bold), Paragraph(complaint.description, normal_val)],
        ]
        
        info_table = Table(info_data, colWidths=[120, 420])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F8FAFC')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP')
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 15))
        
        # 4. Embedded Image (if present)
        if complaint.image_path:
            elements.append(Paragraph("Uploaded Image Attachment", section_heading))
            try:
                if complaint.image_path.startswith('http'):
                    # Fetch from Cloudinary
                    res = requests.get(complaint.image_path, timeout=8)
                    if res.status_code == 200:
                        img_io = io.BytesIO(res.content)
                        report_img = Image(img_io, width=220, height=165)
                        elements.append(report_img)
                else:
                    # Fetch from local directory
                    local_filename = complaint.image_path.split('/')[-1]
                    local_path = os.path.join(current_app.config['UPLOAD_FOLDER'], local_filename)
                    if os.path.exists(local_path):
                        report_img = Image(local_path, width=220, height=165)
                        elements.append(report_img)
            except Exception as e:
                elements.append(Paragraph(f"<i>Could not load image: {str(e)}</i>", normal_val))
            elements.append(Spacer(1, 15))
            
        # 5. Status History Timeline
        elements.append(Paragraph("Status History & Remarks", section_heading))
        history_rows = [
            [Paragraph("<b>Status</b>", normal_bold), 
             Paragraph("<b>Remarks / Activity</b>", normal_bold), 
             Paragraph("<b>Updated By</b>", normal_bold), 
             Paragraph("<b>Date & Time</b>", normal_bold)]
        ]
        
        for hist in reversed(complaint.history):
            history_rows.append([
                Paragraph(hist.status, normal_val),
                Paragraph(hist.remarks or "No remarks provided.", normal_val),
                Paragraph(hist.updater.full_name if hist.updater else "System", normal_val),
                Paragraph(hist.updated_at.strftime('%Y-%m-%d %H:%M:%S'), normal_val)
            ])
            
        history_table = Table(history_rows, colWidths=[80, 220, 110, 130])
        history_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'TOP')
        ]))
        elements.append(history_table)
        
        # Build document
        doc.build(elements)
        
        # Reset pointer and send file
        pdf_buffer.seek(0)
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f"Complaint_Report_{complaint_id}.pdf"
        )
    except Exception as e:
        return jsonify({'message': f'Failed to generate PDF: {str(e)}'}), 500
