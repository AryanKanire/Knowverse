# Knowverse – A Full-Stack Learning Management System

## Overview

**Knowverse** is a comprehensive Learning Management System (LMS) built with the MERN stack. The platform empowers students and instructors to manage, deliver, and track online courses efficiently. Key features include secure enrollment with PayPal, progress tracking, role-based access, and an analytics-powered admin dashboard.

## Features

### 🎓 Student Features:
1. **Authentication**:
   - JWT-based secure signup and login.
2. **Course Search**:
   - Browse and filter a catalog of available courses.
3. **Course Enrollment**:
   - Enroll in paid courses using **PayPal integration**.
4. **Course Access & Previews**:
   - Purchased courses are unlocked instantly.
   - Unpurchased courses allow access to previews and details.
5. **Progress Tracking**:
   - Lectures are tracked and marked upon completion with visual indicators.

### 🛠️ Admin Features:
1. **Role Management**:
   - Assign instructor roles by updating user roles in MongoDB.
2. **Course Management**:
   - Create, edit, and delete courses.
3. **Analytics Dashboard**:
   - Track enrolled students and revenue per course.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt.js
- **Real-time & APIs**: Axios, REST
- **Payment Integration**: PayPal
- **UI Styling**: Tailwind CSS (optional)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/knowverse.git
   cd knowverse
