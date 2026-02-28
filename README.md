# Formuated_Pro
Formulated Pro is an AI-powered web platform that simplifies government job applications by automatically extracting data from uploaded documents using OCR and intelligently filling application forms. Users can review, edit, and securely submit forms with JWT-based authentication and data storage.

# 🚀 Automated Form Filling System

## 📌 Overview

**Automated Form Filling System** is an AI-powered web application designed to simplify and accelerate the government job application process. The platform automatically extracts user data from uploaded documents using OCR and intelligently fills application forms using AI/LLM techniques.

Users can review, edit, and securely submit forms through a protected interface with JWT-based authentication.

---

## 🎯 Problem Statement

Filling government job forms manually is:

* Time-consuming
* Repetitive
* Error-prone
* Complex due to multiple document uploads

This system reduces manual effort by automating the data extraction and form-filling process.

---

## 💡 Key Features

### 🔐 Secure Authentication

* User Signup & Login
* JWT-based authentication
* Protected routes

### 📄 Document Upload

* Upload certificates, ID proofs, mark sheets, etc.
* Secure file storage

### 🔍 OCR-Based Data Extraction

* Extracts text from uploaded documents
* Parses important fields like Name, DOB, Address, Qualification

### 🤖 AI/LLM-Based Form Filling

* Intelligent mapping of extracted data
* Automatically fills government application forms

### 📝 Manual Review & Edit

* Users can verify and modify auto-filled data
* Prevents incorrect submissions

### 💾 Secure Data Storage

* Saved application forms
* Future reuse of stored data

---

## 🏗️ Tech Stack

### Frontend

* React.js
* Tailwind CSS / Material UI
* Axios

### Backend

* Node.js
* Express.js
* JWT Authentication

### Database

* MySQL

### AI & Automation

* OCR Engine
* AI/LLM for intelligent data mapping

---

## 📂 Project Structure

```
Automated-Form-Filling-System/
│
├── frontend/        # React Frontend
├── backend/         # Node + Express Backend
├── uploads/         # Uploaded Documents
├── controllers/
├── routes/
├── models/
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/Automated-Form-Filling-System.git
cd Automated-Form-Filling-System
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```

Create a `.env` file:

```
PORT=5000
JWT_SECRET=your_secret_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🔄 Workflow

1. User registers or logs in
2. Uploads required documents
3. OCR extracts data
4. AI maps extracted data to application form
5. User reviews and edits
6. Final submission
7. Data stored securely

---

## 🔮 Future Enhancements

* Resume Builder
* Auto form submission integration
* Multi-language support
* AI-based error detection
* Government portal integration

---

## 📊 Use Case

* Government Job Applicants
* Competitive Exam Candidates
* Bulk Application Processing

---

## 🛡️ Security Measures

* JWT Authentication
* Password Hashing
* Secure File Handling
* Input Validation
* Protected APIs

---

## 👨‍💻 Author

Raj Upadhyay
B.Tech CSE

---

## 📜 License

This project is licensed under the MIT License.


# System Architecture Diagram
                         ┌───────────────────────────┐
                         │        End User           │
                         │  (Job Applicant / Admin)  │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │        Frontend Layer     │
                         │        (React.js)         │
                         │ - UI Forms                │
                         │ - Document Upload         │
                         │ - Preview & Edit          │
                         └─────────────┬─────────────┘
                                       │ REST API Calls (HTTPS)
                                       ▼
                         ┌───────────────────────────┐
                         │        Backend Layer      │
                         │       (Node.js + Express) │
                         │ - Authentication (JWT)    │
                         │ - Form Processing Logic   │
                         │ - API Controllers         │
                         └─────────────┬─────────────┘
                                       │
                 ┌─────────────────────┼─────────────────────┐
                 ▼                     ▼                     ▼
     ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
     │   OCR Engine     │   │   AI/LLM Engine  │   │   File Storage   │
     │ - Text Extraction│   │ - Data Mapping   │   │ - Uploaded Docs  │
     │ - Entity Parsing │   │ - Field Matching │   │ - Secure Access  │
     └──────────────────┘   └──────────────────┘   └──────────────────┘
                                       │
                                       ▼
                         ┌───────────────────────────┐
                         │       Database Layer      │
                         │         (MySQL)           │
                         │ - User Data               │
                         │ - Extracted Data          │
                         │ - Application Records     │
                         └───────────────────────────┘