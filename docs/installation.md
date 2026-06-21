# Local Setup & Installation Guide (Windows)

Follow these instructions to set up, configure, and execute the **AI Smart Campus Assistant** locally on your system.

---

## 1. Prerequisites

Verify that the following software is installed on your machine:
1.  **Node.js**: Version 18.0.0 or higher.
2.  **Python**: Version 3.8.0 or higher (with `pip` package manager).
3.  **MySQL Server**: Version 8.0 or higher (community edition is perfect).

---

## 2. Configuration Settings

### 2.1. Copy Environment Configuration
Navigate to the `backend/` folder and copy the template `.env.example` to `.env`.
You can do this using standard file managers, or in PowerShell:
```powershell
cp backend/.env.example backend/.env
```

### 2.2. Edit `.env` Configurations
Open the newly created `backend/.env` file and customize the following settings:

*   **`DATABASE_URL`**: Update this connection string with your local MySQL username and password:
    ```ini
    # Format: mysql+pymysql://<username>:<password>@<host>:<port>/<db_name>
    DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/smart_campus
    ```
    *(If your root account has no password, configure it as `mysql+pymysql://root:@localhost:3306/smart_campus`)*

*   **`HF_API_TOKEN`**: For live AI chatbot conversations and image classification, generate a **User Access Token** (Read permission is sufficient) from your Hugging Face account settings and enter it here:
    ```ini
    HF_API_TOKEN=hf_abc123xyz...
    ```
    *(If left blank, the application will automatically activate offline rule-based fallbacks for testing)*

*   **`CLOUDINARY_*`**: To save issue images in the cloud, enter your Cloudinary keys.
    ```ini
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    ```
    *(If left blank, images are saved locally in the `backend/app/static/uploads` folder)*

*   **`SMTP_*`**: To receive email notifications on status changes, configure SMTP credentials:
    ```ini
    SMTP_SERVER=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USERNAME=your_email@gmail.com
    SMTP_PASSWORD=your_gmail_app_password
    SMTP_FROM_EMAIL=your_email@gmail.com
    ```
    *(If left blank, status change emails are simulated and printed in the backend terminal console)*

---

## 3. Backend Setup & Run

1.  Open your terminal and navigate to the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Create a Python virtual environment (Recommended):
    ```bash
    python -m venv venv
    venv\Scripts\activate
    ```
3.  Install the Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the application launch script:
    ```bash
    python run.py
    ```
    *   **What this does**: It verifies your database connection, auto-creates the MySQL database `smart_campus` if it does not exist, runs SQLAlchemy table migrations, seeds chatbot lookup data, and boots the Flask dev server on **`http://localhost:5000`**.

---

## 4. Frontend Setup & Run

1.  Open a new terminal window and navigate to the `frontend/` directory:
    ```bash
    cd frontend
    ```
2.  Install the package dependencies:
    On Windows systems with disabled PowerShell scripts execution, run:
    ```powershell
    npm.cmd install
    ```
3.  Launch the Vite development server:
    ```powershell
    npm.cmd run dev
    ```
4.  Open your web browser and go to: **`http://localhost:5173`**.

---

## 5. Troubleshooting Tips

### 5.1. MySQL Connection Failures
*   **Error**: `Can't connect to MySQL server on 'localhost'` or authentication errors.
*   **Resolution**: 
    *   Verify that your MySQL Service is running. In PowerShell (Admin), execute `Get-Service -Name MySQL*` or `Start-Service -Name MySQL80`.
    *   Verify your username and password in `backend/.env`.

### 5.2. PowerShell Script Execution Disabled
*   **Error**: `.ps1 cannot be loaded because running scripts is disabled on this system`.
*   **Resolution**: Append `.cmd` to scripts (e.g. `npm.cmd install` instead of `npm install`, and `npx.cmd` instead of `npx`).

### 5.3. PDF Download Failures
*   **Error**: Report download fails or prints errors.
*   **Resolution**: Ensure `reportlab` library has compiled properly during pip install. Run `pip show reportlab` to verify installation.
