# Learning Management System (LMS) Project

## Overview

This is a **Learning Management System (LMS)** built using modern web technologies. The platform provides functionalities for students and administrators (instructors) to manage and engage with courses. It includes features like course search, enrollment, payment integration, and course progress tracking.

## Features

### Student Features:
1. **Authentication**:
   - **Signup & Login**: Users can register and log in using JWT-based authentication for secure access.
2. **Course Search**:
   - Students can browse and search for various courses available on the platform.
3. **Course Enrollment**:
   - Students can enroll in courses via **PayPal payment integration**.
4. **Course Details**:
   - If the course is purchased, students gain immediate access to the course.
   - If not purchased, users can view course details and access free previews.
5. **Progress Tracking**:
   - Completed lectures are marked with a green tick to show course progress.

### Admin Features:
1. **Role Management**:
   - Admin roles are manually assigned in MongoDB by changing a user’s role to "instructor."
2. **Course Management**:
   - Add, update, or delete courses.
3. **Analytics**:
   - View the number of enrolled students and revenue generated for each course.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Frontend**: React.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Payment Integration**: PayPal

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/lms-project.git
   cd lms-project
