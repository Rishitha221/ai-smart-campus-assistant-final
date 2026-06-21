import os
import time
import hashlib
import requests
from flask import current_app
from werkzeug.utils import secure_filename

def upload_image(file_obj):
    """
    Uploads a file object to Cloudinary if configured. 
    Otherwise, saves it locally to the Flask static directory.
    Returns: The public URL or relative path to the image, or None if upload failed.
    """
    cloud_name = current_app.config.get('CLOUDINARY_CLOUD_NAME')
    api_key = current_app.config.get('CLOUDINARY_API_KEY')
    api_secret = current_app.config.get('CLOUDINARY_API_SECRET')
    
    # Check if Cloudinary is configured
    if cloud_name and api_key and api_secret:
        try:
            timestamp = int(time.time())
            # Prepare signature parameters (alphabetical order)
            params = f"timestamp={timestamp}{api_secret}"
            signature = hashlib.sha1(params.encode('utf-8')).hexdigest()
            
            url = f"https://api.cloudinary.com/v1_1/{cloud_name}/image/upload"
            
            # Reset file pointer to beginning just in case
            file_obj.seek(0)
            
            files = {
                'file': (file_obj.filename, file_obj.read(), file_obj.content_type)
            }
            data = {
                'api_key': api_key,
                'timestamp': timestamp,
                'signature': signature
            }
            
            response = requests.post(url, files=files, data=data, timeout=15)
            if response.status_code == 200:
                result = response.json()
                return result.get('secure_url')
            else:
                print(f"[Cloudinary Error] Status {response.status_code}: {response.text}")
                # Fallback to local upload if Cloudinary fails
        except Exception as e:
            print(f"[Cloudinary Exception] Failed to upload: {e}")
            # Fallback to local upload if exception occurs
            
    # Fallback to Local Storage
    try:
        filename = secure_filename(file_obj.filename)
        # Add timestamp to filename to prevent collisions
        name, ext = os.path.splitext(filename)
        timestamp_filename = f"{name}_{int(time.time())}{ext}"
        
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], timestamp_filename)
        
        # Reset file pointer and save locally
        file_obj.seek(0)
        file_obj.save(filepath)
        
        # Return local static URL path
        return f"/static/uploads/{timestamp_filename}"
    except Exception as e:
        print(f"[Local Upload Error] Failed to save image: {e}")
        return None
