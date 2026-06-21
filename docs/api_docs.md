# REST API Reference Documentation

All endpoints are hosted relative to the base URL: `http://localhost:5000/api`. 
Protected routes require a JWT token in the request header: `Authorization: Bearer <JWT_TOKEN>`.

---

## 1. Authentication Endpoints

### 1.1. User Registration
Creates a new account (default role is `student`).
*   **URL**: `/auth/register`
*   **Method**: `POST`
*   **Headers**: `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "username": "janedoe",
      "email": "jane@campus.edu",
      "password": "securepassword123",
      "full_name": "Jane Doe",
      "department": "Computer Science",
      "role": "student"
    }
    ```
*   **Success Response** (Code `201 Created`):
    ```json
    {
      "message": "Registration successful. You can now log in.",
      "user": {
        "id": 2,
        "username": "janedoe",
        "email": "jane@campus.edu",
        "role": "student",
        "full_name": "Jane Doe",
        "department": "Computer Science",
        "created_at": "2026-06-05T10:05:00"
      }
    }
    ```

### 1.2. User Login
Authenticates credentials and returns a JWT token.
*   **URL**: `/auth/login`
*   **Method**: `POST`
*   **Headers**: `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "username": "janedoe",
      "password": "securepassword123"
    }
    ```
*   **Success Response** (Code `200 OK`):
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 2,
        "username": "janedoe",
        "email": "jane@campus.edu",
        "role": "student",
        "full_name": "Jane Doe",
        "department": "Computer Science"
      },
      "message": "Login successful."
    }
    ```

### 1.3. Get Profile
Retrieves authenticated user details.
*   **URL**: `/auth/profile`
*   **Method**: `GET`
*   **Headers**: `Authorization: Bearer <token>`
*   **Success Response** (Code `200 OK`):
    ```json
    {
      "id": 2,
      "username": "janedoe",
      "email": "jane@campus.edu",
      "role": "student",
      "full_name": "Jane Doe",
      "department": "Computer Science",
      "created_at": "2026-06-05T10:05:00"
    }
    ```

### 1.4. Update Profile
Modifies user profile fields or changes password.
*   **URL**: `/auth/profile`
*   **Method**: `PUT`
*   **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "full_name": "Jane Mary Doe",
      "department": "Computer Science",
      "password": "newpassword123"
    }
    ```
*   **Success Response** (Code `200 OK`):
    ```json
    {
      "message": "Profile updated successfully.",
      "user": { ... }
    }
    ```

---

## 2. AI Chatbot Endpoints

### 2.1. Submit Query
Sends a message to the chatbot.
*   **URL**: `/chatbot/query`
*   **Method**: `POST`
*   **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "message": "What is the tuition fee for engineering?"
    }
    ```
*   **Success Response** (Code `201 Created`):
    ```json
    {
      "chat": {
        "id": 15,
        "student_id": 2,
        "user_message": "What is the tuition fee for engineering?",
        "bot_response": "The tuition fee structure is as follows: B.Tech (Merit Quota) is $1,500...",
        "timestamp": "2026-06-05T10:20:00"
      }
    }
    ```

### 2.2. Get Chat History
Returns past Q&A logs for the authenticated student.
*   **URL**: `/chatbot/history`
*   **Method**: `GET`
*   **Headers**: `Authorization: Bearer <token>`
*   **Success Response** (Code `200 OK`):
    ```json
    {
      "history": [
        {
          "id": 15,
          "student_id": 2,
          "user_message": "...",
          "bot_response": "...",
          "timestamp": "2026-06-05T10:20:00"
        }
      ]
    }
    ```

---

## 3. Student Complaints Endpoints

### 3.1. Submit Complaint
Registers a new issue. Uploads image to Cloudinary and runs CLIP image classifier.
*   **URL**: `/complaints/submit`
*   **Method**: `POST`
*   **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
*   **Request Form Data**:
    *   `title` (string): Title of issue.
    *   `description` (string): Complete description.
    *   `location` (string): Room or block.
    *   `image` (file, optional): Selected issue photo.
*   **Success Response** (Code `201 Created`):
    ```json
    {
      "message": "Complaint submitted successfully.",
      "complaint": {
        "id": "CMP-91A23D",
        "student_id": 2,
        "student_name": "Jane Doe",
        "title": "Broken leg on lecture chair",
        "description": "...",
        "location": "Room 302",
        "image_path": "https://res.cloudinary.com/...",
        "predicted_category": "Furniture Damage",
        "confidence_score": 0.9415,
        "status": "Pending",
        "created_at": "2026-06-05T10:30:00",
        "updated_at": "2026-06-05T10:30:00",
        "history": [ ... ]
      }
    }
    ```

### 3.3. Download Complaint PDF
Generates and downloads a styled PDF summary of the complaint report.
*   **URL**: `/complaints/<complaint_id>/pdf`
*   **Method**: `GET`
*   **Headers**: `Authorization: Bearer <token>`
*   **Success Response** (Code `200 OK`): Binary stream of type `application/pdf`.

---

## 4. Admin Management Endpoints

### 4.1. Get All Complaints
Retrieves all complaints in the database. Accessible by admins only.
*   **URL**: `/admin/complaints`
*   **Method**: `GET`
*   **Query Parameters (Optional)**:
    *   `status`: Filter by status (`Pending`, `In Progress`, `Resolved`).
    *   `category`: Filter by predicted category.
    *   `search`: Search string matching title, description, or student name.
*   **Headers**: `Authorization: Bearer <token>`
*   **Success Response** (Code `200 OK`):
    ```json
    {
      "complaints": [
        {
          "id": "CMP-91A23D",
          "student_name": "Jane Doe",
          "status": "Pending",
          ...
        }
      ]
    }
    ```

### 4.2. Update Complaint Status
Updates status, appends to timelines, sends notification emails, and fires real-time SSE notifications.
*   **URL**: `/admin/complaints/<complaint_id>/status`
*   **Method**: `PUT`
*   **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
*   **Request Body**:
    ```json
    {
      "status": "In Progress",
      "remarks": "Maintenance technician dispatched to classroom."
    }
    ```
*   **Success Response** (Code `200 OK`):
    ```json
    {
      "message": "Status updated successfully.",
      "complaint": { ... }
    }
    ```

### 4.3. Get Analytics
Computes dashboard metrics.
*   **URL**: `/admin/analytics`
*   **Method**: `GET`
*   **Headers**: `Authorization: Bearer <token>`
*   **Success Response** (Code `200 OK`):
    ```json
    {
      "counts": { "total": 12, "pending": 4, "inProgress": 3, "resolved": 5 },
      "categories": { "Furniture Damage": 3, "Cleanliness Issue": 4, "Electrical Issue": 1, ... },
      "trends": { "labels": ["Jan 2026", "Feb 2026", ...], "values": [2, 5, ...] },
      "chatbot": { "totalConversations": 45, "activeUsers": 15, "averageMessagesPerUser": 3.0 }
    }
    ```

### 4.4. Export Complaints to Excel
Downloads Excel file containingfiltered complaints data.
*   **URL**: `/admin/complaints/export`
*   **Method**: `GET`
*   **Headers**: `Authorization: Bearer <token>`
*   **Success Response** (Code `200 OK`): Binary stream of type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

---

## 5. Notifications Endpoints

### 5.1. Real-Time Notifications Stream (SSE)
Establishes a Server-Sent Events (SSE) connection to receive real-time updates.
*   **URL**: `/admin/notifications/stream`
*   **Method**: `GET`
*   **Headers**: `Accept: text/event-stream`
*   **Response Stream Format**:
    ```
    data: {"user_id": 2, "message": "Your complaint CMP-91A23D has been updated...", "complaint_id": "CMP-91A23D", "timestamp": "2026-06-05T10:35:00"}
    ```
