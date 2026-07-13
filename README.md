# 🏢 Apartment Management System (AMS)

A full-stack **Apartment Management System** developed as a DBMS project to simplify apartment administration and resident services. The application provides dedicated dashboards for **Admin**, **Staff**, and **Residents** with secure authentication and real-time database operations.

## 🚀 Live Demo

🔗 **https://final-dbms-backend-pavan-updated.vercel.app/**
## 📌 Features

### 👨‍💼 Admin
- Secure Login
- Dashboard Overview
- Manage Apartments
- Manage Flats
- Manage Owners
- Manage Staff
- Manage Parking Slots
- Assign Staff
- View and Manage Service Requests

### 👷 Staff
- Secure Login
- Staff Dashboard
- View Assigned Requests
- Update Request Status
- View Personal Profile

### 🏠 Resident
- Secure Login
- Resident Dashboard
- View Flat Information
- View Parking Details
- Create Service Requests
- Track Request Status

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES6)

### Backend
- Node.js
- Express.js

### Database
- MySQL

### Deployment
- Frontend & Backend: Vercel
- Database: Railway MySQL

---

## 📂 Project Structure

```text
SECOND AMS
│
├── backend
│   ├── routes
│   ├── db.js
│   ├── server.js
│
├── frontend
│   ├── css
│   ├── js
│   ├── images
│   ├── *.html
│
├── package.json
├── vercel.json
└── README.md
```

---

## 🗄️ Database

The project uses a relational MySQL database with tables such as:

- Apartment
- Flat
- Owner
- Staff
- Parking Slot
- Service Request
- Users

Relationships are implemented using **Primary Keys** and **Foreign Keys** to maintain data integrity.

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone <repository-url>
cd SECOND-AMS
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file.

```env
DB_HOST=your_host
DB_PORT=your_port
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database
PORT=5000
```

### Run the Project

```bash
npm start
```

Open:

```
http://localhost:5000
```

---

## 📸 Modules

- Authentication
- Admin Dashboard
- Staff Dashboard
- Resident Dashboard
- Flat Management
- Owner Management
- Staff Management
- Parking Management
- Service Request Management

---

## 🎯 Learning Outcomes

This project demonstrates practical implementation of:

- Database Management Systems (DBMS)
- CRUD Operations
- RESTful APIs
- Relational Database Design
- Authentication
- Client–Server Architecture
- Frontend–Backend Integration
- Cloud Deployment using Vercel and Railway

---

## 👨‍💻 Developed By

**Pavan Kumar R**

Information Science & Engineering (ISE)

University Visvesvaraya College of Engineering (UVCE)

---

## 📄 License

This project is developed for educational and academic purposes.
