# AI Smart Campus Assistant – Intelligent Student Support & Campus Issue Management System

An enterprise-grade, full-stack, AI-powered web application designed for universities to streamline student inquiries, automate facility maintenance complaint reporting, and provide rich data analytics. 

This project integrates modern frontend development, REST APIs, database design, and machine learning models (zero-shot image classification and conversational NLP) into a cohesive, responsive web platform.

---

## 🚀 Key Features

*   **🔐 Secure JWT Authentication**: Role-based access control (RBAC) separating student portals from administrative panels.
*   **🤖 AI Conversational Chatbot**: Powered by Hugging Face models, featuring context injection (RAG-lite) for XYZ college details (courses, fees, exams, placements, library, hostels) with a keyword-based offline fallback.
*   **📸 AI Image Classification**: Automatically classifies uploaded campus issue photos (broken chairs, water leaks, dirty areas, electrical faults, cracked walls) into 5 categories using the **Hugging Face CLIP Zero-Shot Image Classification** model (`openai/clip-vit-base-patch32`).
*   **📋 Complaint Tracking Timeline**: Tracks issue statuses (`Pending` &rarr; `In Progress` &rarr; `Resolved`) with date logs and admin action remarks.
*   **🔔 Real-Time Notification Stream**: Streams instant toast alerts to students when administrators update their complaints, using Server-Sent Events (SSE).
*   **📧 Automated Email Alerts**: Sends HTML emails (via SMTP) notifying students about status updates and administrator remarks.
*   **📄 PDF Report Generation**: Generates official, styled PDF summaries of individual issues (including embedded images, timelines, and logos) using Python's `reportlab` library.
*   **📊 Interactive Analytics Dashboard**: Rich visualizations of issue category shares, monthly submission trends, and chatbot engagement rates using `Chart.js`.
*   **📥 Excel Export Utility**: Allows administrators to export registries of filtered complaints directly to spreadsheet format using `pandas` and `openpyxl`.
*   **🌓 Dark & Light Mode**: Fluid transitions and premium glassmorphism layouts built with Tailwind CSS.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), Tailwind CSS, React Router DOM, Lucide Icons, Chart.js, Tailwind custom glassmorphism.
*   **Backend**: Python, Flask, PyMySQL, Flask-SQLAlchemy, Flask-CORS, PyJWT, ReportLab, Pandas, Pillow.
*   **Database**: MySQL Server (Ver 8.0+).
*   **AI Models**: Hugging Face Inference API (`meta-llama/Llama-3-8b-instruct` / `openai/clip-vit-base-patch32`).

---

## 📂 Project Repository Structure

```
ai-smart-campus-assistant/
├── backend/
│   ├── app/
│   │   ├── routes/              # API Blueprint controllers (auth, chatbot, complaints, admin)
│   │   ├── services/            # Services (AI services, Cloudinary, SMTP email, DB seeder)
│   │   ├── models.py            # SQLAlchemy database schemas
│   │   ├── utils.py             # JWT & validation decorators
│   │   └── __init__.py          # Flask factory & initialization
│   ├── static/uploads/          # Local static upload directory (fallback)
│   ├── config.py                # Server config loader
│   ├── requirements.txt         # Python library dependencies
│   ├── run.py                   # Entrypoint with auto-DB creation & seeder
│   └── .env                     # Local environment variables config
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable layout UI (Sidebar, Navbar, ThemeToggle)
│   │   ├── context/             # Global states (AuthContext, ThemeContext)
│   │   ├── pages/               # Views (Login, Register, Dashboard, Chatbot, ReportIssue, etc.)
│   │   ├── App.jsx              # Routing & guards binder
│   │   ├── index.css            # Custom glassmorphism, animations & Tailwind imports
│   │   └── main.jsx             # React DOM loader
│   ├── tailwind.config.js       # Tailwind CSS config
│   ├── postcss.config.js        # PostCSS compiler config
│   ├── package.json             # Npm packages list
│   └── index.html               # Main page layout & SEO metadata
├── docs/                        # Detailed project documentation
│   ├── installation.md          # Setup & execution instructions
│   ├── db_schema.md             # Complete database dictionary
│   ├── api_docs.md              # REST API endpoint reference
│   └── architecture.md          # Full system architecture diagram
└── README.md                    # Project index introduction
```

---

## ⏱️ Rapid Local Execution (Quick Start)

### Prerequisites
1. **Node.js** (v18+) and **Python** (v3.8+) installed.
2. **MySQL Server** running locally.

### Step 1: Database Setup
Make sure your local MySQL server is running. You **do not** need to create the database manually; the backend boot script will verify, create, and seed `smart_campus` database automatically on launch!

### Step 2: Run Backend Server
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Configure your MySQL credentials, Hugging Face Token, and Cloudinary keys inside `.env` (a template is available in `.env.example`).
3. Run the entrypoint script:
   ```bash
   python run.py
   ```
   *The server starts on: **`http://localhost:5000`***

### Step 3: Run Frontend Client
1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The client opens on: **`http://localhost:5173`***

---

## 📖 Complete Documentation
*   📘 **[Setup Guide](docs/installation.md)**
*   📕 **[Database Schema Dictionary](docs/db_schema.md)**
*   📗 **[API Endpoint Reference](docs/api_docs.md)**
*   📙 **[System Architecture](docs/architecture.md)**
