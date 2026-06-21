import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import current_app

def send_email(recipient_email, subject, body_html, body_text=""):
    """
    Sends an email to the recipient using SMTP configurations.
    If configurations are missing, it prints the email details to the console.
    """
    smtp_server = current_app.config.get('SMTP_SERVER')
    smtp_port = current_app.config.get('SMTP_PORT')
    smtp_username = current_app.config.get('SMTP_USERNAME')
    smtp_password = current_app.config.get('SMTP_PASSWORD')
    smtp_from = current_app.config.get('SMTP_FROM_EMAIL')
    
    # Check if SMTP configuration is provided
    if smtp_server and smtp_username and smtp_password and smtp_from:
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = smtp_from
            msg['To'] = recipient_email
            
            # Attach plain text version
            if body_text:
                msg.attach(MIMEText(body_text, 'plain'))
            else:
                msg.attach(MIMEText("Please view this email in an HTML compatible client.", 'plain'))
                
            # Attach HTML version
            msg.attach(MIMEText(body_html, 'html'))
            
            # Connect and send
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()  # Enable security
            server.login(smtp_username, smtp_password)
            server.sendmail(smtp_from, recipient_email, msg.as_string())
            server.quit()
            print(f"[Email Service] Email sent successfully to {recipient_email}")
            return True
        except Exception as e:
            print(f"[Email Service Error] Failed to send email to {recipient_email}: {e}")
            return False
    else:
        # Development fallback (log to console)
        print("\n=== [Email Service Simulator] ===")
        print(f"To: {recipient_email}")
        print(f"Subject: {subject}")
        print(f"Content:\n{body_html}")
        print("=================================\n")
        return True


def send_status_update_email(student_email, student_name, complaint_id, complaint_title, old_status, new_status, remarks=""):
    """
    Helper function to send status change notification emails.
    """
    subject = f"[AI Smart Campus] Update on Complaint {complaint_id}"
    
    remarks_html = f"<p><strong>Admin Remarks:</strong> {remarks}</p>" if remarks else ""
    
    body_html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">Complaint Status Update</h2>
          <p>Dear {student_name},</p>
          <p>The status of your campus complaint has been updated.</p>
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Complaint ID:</strong> {complaint_id}</p>
            <p style="margin: 5px 0;"><strong>Title:</strong> {complaint_title}</p>
            <p style="margin: 5px 0;"><strong>Status Change:</strong> 
              <span style="text-decoration: line-through; color: #DC2626;">{old_status}</span> 
              &rarr; 
              <span style="color: #059669; font-weight: bold;">{new_status}</span>
            </p>
          </div>
          {remarks_html}
          <p>You can check the complete history and details of your complaint on the Student Dashboard.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This is an automated notification from the AI Smart Campus Assistant. Please do not reply directly to this email.</p>
        </div>
      </body>
    </html>
    """
    
    return send_email(student_email, subject, body_html)
