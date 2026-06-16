# Online Complaint Registration and Management System

This is a MERN stack web application created for a virtual internship project. The main purpose of this project is to make the complaint handling process easier for users, support agents, and administrators.

Users can register complaints, track their complaint status, communicate with the assigned agent, and submit feedback after resolution. Agents can manage assigned complaints, and admins can monitor the overall system, assign complaints, and view basic analytics.

---

## Project Overview

In many organizations, complaints are handled through emails, phone calls, or manual records. This can make it difficult to track progress, assign responsibility, and measure resolution performance.

This project solves that problem by providing a centralized complaint management platform with role-based access.

### Roles in the System

| Role | Main Responsibilities |
|---|---|
| User | Register complaints, track status, chat with agent, submit feedback |
| Agent | View assigned complaints, update progress, resolve issues |
| Admin | Manage users, assign agents, monitor complaints, view analytics |

---

## Tech Stack Used

### Frontend
- React.js
- React Router DOM
- Axios
- Bootstrap
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- express-validator
- Helmet
- CORS

---

## Main Features

### User Features
- User registration and login
- JWT-based authentication
- Complaint submission form
- Complaint tracking with status updates
- Complaint details page with timeline
- Messaging between user and agent
- Feedback submission after complaint resolution

### Agent Features
- Agent dashboard
- View assigned complaints
- Update complaint status
- Add progress notes
- Communicate with users
- View feedback-related performance summary

### Admin Features
- Admin dashboard
- View all complaints
- Assign or reassign agents
- Create staff accounts
- View users and agents
- Monitor complaint statistics
- View complaints that may need attention

---

## Complaint Status Flow

A complaint can move through the following statuses:

```text
OPEN → ASSIGNED → IN_PROGRESS → WAITING_USER → RESOLVED → CLOSED
```

A complaint can also be marked as:

```text
REJECTED
```

---

## Folder Structure

```text
online-complaint-registration-management-system/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── utils/
│       └── validators/
│
├── frontend/
│   ├── public/
│   ├── package.json
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── utils/
│
├── docs/
├── screenshots/
├── README.md
└── package.json
```

---

## Database Collections

### Users
Stores registered users, agents, and admins.

Important fields:
- name
- email
- password
- phone
- role
- active status

### Complaints
Stores complaint information and workflow data.

Important fields:
- title
- description
- category
- priority
- status
- user
- agent
- timeline
- messages
- resolution

### Agents
Stores extra information related to agent workload and categories.

Important fields:
- user
- categories
- assigned complaints
- maximum open complaints

### Feedback
Stores feedback after complaint resolution.

Important fields:
- complaint
- user
- agent
- rating
- comment

---

## Installation and Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd online-complaint-registration-management-system
```

### 2. Install dependencies

Install root dependencies:

```bash
npm install
```

Install backend and frontend dependencies:

```bash
npm run install:all
```

### 3. Configure backend environment variables

Create a `.env` file inside the `backend` folder using the example file:

```bash
cp backend/.env.example backend/.env
```

Update the values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/complaint_management
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
AUTO_ASSIGN=true
```

### 4. Seed demo data optional

```bash
npm run seed -- --fresh
```

Demo login details:

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Admin@123 |
| Agent | agent@example.com | Agent@123 |
| User | user@example.com | User@123 |

### 5. Run the project

Run both frontend and backend together:

```bash
npm run dev
```

Or run them separately:

```bash
npm run server
npm run client
```

Backend runs on:

```text
http://localhost:5000
```

Frontend runs on:

```text
http://localhost:3000
```

---

## API Documentation

Basic API details are available in:

```text
docs/API_DOCUMENTATION.md
```

---

## Screenshots

Screenshots can be added inside the `screenshots` folder.

Suggested screenshots:

- Home page
- Login page
- User dashboard
- Complaint details page
- Agent dashboard
- Admin dashboard

---

## Security Implemented

- Password hashing using bcryptjs
- JWT token-based authentication
- Role-based API authorization
- Input validation using express-validator
- CORS configuration
- Helmet for basic API security headers
- Protected routes on frontend

---

## What I Learned from This Project

- Creating REST APIs using Express.js
- Designing MongoDB schemas with relationships
- Using JWT for authentication
- Implementing role-based access control
- Connecting React frontend with backend APIs using Axios
- Managing global authentication state with React Context API
- Building dashboards for different user roles
- Handling form validation and error messages

---

## Future Improvements

Some features that can be added later:

- Real-time chat using Socket.IO
- File upload support for complaint attachments
- Email notifications with production SMTP setup
- Advanced admin charts
- Password reset functionality
- Complaint escalation based on deadline
- Unit and integration tests

---

## Project Status

The main modules are completed and ready for demonstration. The project can be extended further based on internship requirements or organization-specific complaint workflows.
