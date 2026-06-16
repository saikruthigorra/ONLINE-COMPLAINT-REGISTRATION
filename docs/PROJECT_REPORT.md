# Project Report

## Project Title

Online Complaint Registration and Management System

## Project Type

Full-stack MERN web application

## Objective

The objective of this project is to create a web-based complaint management system where users can submit complaints and track their progress. The system also helps agents handle assigned complaints and allows administrators to manage the overall workflow.

## Problem Statement

In a manual complaint handling process, users often do not know the current status of their complaint. It is also difficult for administrators to assign complaints, check pending issues, and review agent performance. This project provides a centralized solution for complaint registration, tracking, assignment, and resolution.

## Proposed Solution

The proposed system provides three role-based dashboards:

1. User dashboard for complaint registration and tracking
2. Agent dashboard for complaint handling and status updates
3. Admin dashboard for managing complaints, agents, users, and analytics

The backend provides REST APIs, and the frontend consumes these APIs using Axios.

## Modules Implemented

### 1. Authentication Module

- User registration
- User login
- JWT token generation
- Password hashing using bcryptjs
- Protected routes

### 2. Complaint Module

- Create complaint
- View complaint list
- View complaint details
- Update complaint status
- Delete complaint where allowed
- Complaint timeline tracking

### 3. Agent Assignment Module

- Admin can assign complaints to agents
- System supports automatic assignment based on category and workload
- Agent profile stores categories and assigned complaint IDs

### 4. Communication Module

- Users and agents can exchange messages inside complaint details
- Messages are stored under the complaint document
- Frontend refreshes complaint details periodically to show updates

### 5. Feedback Module

- Users can submit feedback after complaint resolution
- Feedback includes rating and comment
- Admins and agents can view feedback summary

### 6. Admin Analytics Module

- Total complaints
- Complaints by status
- Complaints by category
- Recent complaints
- Agent performance summary
- Older unresolved complaints

## Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend UI |
| Bootstrap | Styling and responsive layout |
| Axios | API calls |
| Node.js | Backend runtime |
| Express.js | REST API framework |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| JWT | Authentication |
| bcryptjs | Password hashing |
| express-validator | Input validation |

## Database Design

The system uses four main collections:

1. Users
2. Complaints
3. Agents
4. Feedback

Relationships:

- A complaint belongs to one user.
- A complaint may be assigned to one agent.
- Feedback is linked to a complaint, user, and agent.
- Agent profile is linked to a user account with AGENT role.

## Role-Based Access

### User

- Register and login
- Submit complaints
- View own complaints
- Message assigned agent
- Submit feedback

### Agent

- View assigned complaints
- Update status
- Add notes and resolution
- Message complaint creator

### Admin

- View all complaints
- Assign agents
- Create staff accounts
- View analytics
- Manage users

## Testing Performed

The following flows were checked during development:

- User registration and login
- JWT protected API access
- Complaint creation
- Complaint listing based on role
- Admin complaint assignment
- Agent status update
- User feedback submission
- Frontend routing protection
- Form validation errors

## Limitations

- Chat uses API-based refresh instead of WebSocket real-time communication.
- File attachment upload is represented in schema but not fully implemented in UI.
- Email notifications require SMTP configuration.
- Automated test cases can be added in future.

## Future Scope

- Add Socket.IO for real-time chat
- Add attachment upload using Multer or cloud storage
- Add forgot password/reset password
- Add advanced analytics charts
- Add automated unit and integration tests
- Add complaint escalation system

## Conclusion

The project successfully implements a complaint management workflow using the MERN stack. It provides secure authentication, role-based access, complaint tracking, assignment, feedback, and dashboards for different users of the system.
