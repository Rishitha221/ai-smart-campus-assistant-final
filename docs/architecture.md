# System Architecture Documentation

This document explains the technical architecture, data flow, and system integration patterns for the **AI Smart Campus Assistant**.

---

## 1. High-Level Architecture Diagram

The system follows a classic **Client-Server-Database** architecture with external integrations for Artificial Intelligence (Hugging Face) and file storage (Cloudinary).

```mermaid
graph TD
    %% Frontend Subsystem
    subgraph Frontend [React Client Subsystem]
        A[React UI Pages] -->|Context API| B[Auth / Theme State]
        A -->|SSE EventSource| C[SSE Toast Listener]
    end

    %% Backend Subsystem
    subgraph Backend [Flask API Subsystem]
        D[Flask API Gateway] -->|Auth Guard| E[REST Controllers]
        E -->|JWT Verify| F[Utils]
        E -->|DB Queries| G[SQLAlchemy ORM]
        
        subgraph Services [Services Layer]
            H[AI Service]
            I[Cloudinary Service]
            J[Email Service]
        end
        
        E -->|Call Service| Services
    end

    %% Storage & External APIs
    subgraph Storage [Storage & External Services]
        K[(MySQL Database)]
        L[Hugging Face Inference API]
        M[Cloudinary Cloud Storage]
        N[SMTP Email Server]
    end

    %% Connections
    A -->|HTTP REST Requests| D
    G -->|SQL Queries| K
    H -->|HTTPS requests| L
    I -->|HTTPS uploads| M
    J -->|SMTP protocol| N
```

---

## 2. Key Transaction Sequences

### 2.1. Issue Submission & AI Classification Flow
This sequence details what happens when a student submits an issue with an image attachment:

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Client
    participant API as Flask API
    participant Cloud as Cloudinary
    participant HF as Hugging Face (CLIP)
    participant DB as MySQL DB

    Student->>API: POST /complaints/submit (multipart form data with Image)
    activate API
    API->>HF: POST /models/openai/clip-vit-base-patch32 (Image + Labels)
    activate HF
    HF-->>API: Return Labels probabilities
    deactivate HF
    API->>API: Select category with highest confidence score
    API->>Cloud: Sign & upload image
    activate Cloud
    Cloud-->>API: Return secure Image URL
    deactivate Cloud
    API->>DB: Save complaint & Pending status history logs
    activate DB
    DB-->>API: Confirm database commit
    deactivate DB
    API-->>Student: Return JSON including ID, AI Category, and Confidence
    deactivate API
    Student->>Student: Render Success Panel with AI predictions
```

---

## 2.2. Status Modification & Real-Time Alert Broadcast
This sequence details the dispatching of automated email alerts and real-time notifications to the client browser when an admin modifies a complaint's status:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin Client
    participant API as Flask API
    participant DB as MySQL DB
    participant SSE as SSE Broker (Queue)
    participant Mail as SMTP Email Server
    actor Student as Student Client

    Admin->>API: PUT /admin/complaints/:id/status (status + remarks)
    activate API
    API->>DB: Update status, log remarks, save notification
    activate DB
    DB-->>API: Confirm commit
    deactivate DB
    API->>SSE: broadcast_sse_notification(student_id, message)
    activate SSE
    SSE-->>Student: Stream data event toast alert (Real-Time notification)
    deactivate SSE
    API->>Mail: send_status_update_email()
    activate Mail
    Mail-->>Student: Delivers notification email
    deactivate Mail
    API-->>Admin: Return HTTP 200 (Success)
    deactivate API
```

---

## 3. Key Design Decisions & Architectural Quality

1.  **Thread-Safe SSE Broker**: By using Python's built-in `queue.Queue` list, the application manages multi-client Server-Sent Events streams natively inside the Flask thread pool. This allows real-time notifications to push without using heavy Node.js Socket.io or Redis systems, keeping local deployment simple and lightweight.
2.  **Graceful API Fallbacks (Self-Healing AI)**: The AI service checks if a Hugging Face API key is present in `.env`. If offline or without key, it extracts keywords from filenames (for images) and query strings (for chat) to simulate classification and lookup. The UI remains fully functional and visual in offline presentation environments.
3.  **Client-Side Blob Download**: PDF reports and Excel exports are compiled on the server (using ReportLab and Pandas respectively) and returned as raw binary streams. The React client intercepts these responses as `Blob` types, creating a local browser URL dynamically to trigger standard downloads. This prevents writing temporary files to the server disk, saving storage space.
