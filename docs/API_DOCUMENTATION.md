# API Documentation

Base URL:

```text
http://localhost:5000/api
```

All protected routes require the JWT token in the request header:

```text
Authorization: Bearer <token>
```

---

## Health Check

### GET `/health`

Checks whether the backend API is running.

---

## Authentication APIs

### POST `/auth/register`

Registers a normal user account.

Request body:

```json
{
  "name": "Demo User",
  "email": "user@example.com",
  "password": "User@123",
  "phone": "9000000000"
}
```

### POST `/auth/login`

Logs in a user, agent, or admin.

Request body:

```json
{
  "email": "user@example.com",
  "password": "User@123"
}
```

### GET `/auth/me`

Returns the currently logged-in user.

### PUT `/auth/profile`

Updates logged-in user profile.

---

## Complaint APIs

### POST `/complaints`

Creates a new complaint.

Allowed roles:

- USER
- ADMIN

Request body:

```json
{
  "title": "Internet connection issue",
  "description": "My internet connection is disconnecting many times during the day.",
  "category": "Technical",
  "priority": "HIGH"
}
```

### GET `/complaints`

Returns complaints based on logged-in role.

- USER sees own complaints
- AGENT sees assigned complaints
- ADMIN sees all complaints

Optional query parameters:

```text
status=OPEN
category=Technical
priority=HIGH
search=internet
page=1
limit=20
```

### GET `/complaints/:id`

Returns complaint details with user, agent, messages, and timeline.

### PUT `/complaints/:id`

Updates complaint details.

Allowed when:

- Admin updates any complaint
- User updates own complaint only if status is OPEN

### PATCH `/complaints/:id/assign`

Assigns a complaint to an agent.

Allowed role:

- ADMIN

Request body:

```json
{
  "agentId": "agent_user_id_here"
}
```

### PATCH `/complaints/:id/status`

Updates complaint status.

Allowed roles:

- ADMIN
- Assigned AGENT
- USER only for closing resolved complaint

Request body:

```json
{
  "status": "RESOLVED",
  "note": "Issue has been fixed.",
  "resolution": "Router configuration was updated."
}
```

### POST `/complaints/:id/messages`

Adds a message to the complaint conversation.

Request body:

```json
{
  "message": "Please provide an update."
}
```

### DELETE `/complaints/:id`

Deletes a complaint.

Allowed when:

- Admin deletes any complaint
- User deletes own complaint only if status is OPEN

---

## User and Agent APIs

These APIs are mainly for admin use.

### GET `/users`

Returns user list.

Optional query parameters:

```text
role=USER
search=demo
active=true
page=1
limit=20
```

### POST `/users`

Creates a new user, agent, or admin account.

Request body:

```json
{
  "name": "Support Agent",
  "email": "agent@example.com",
  "password": "Agent@123",
  "phone": "9000000000",
  "role": "AGENT",
  "categories": ["Technical", "Billing"],
  "maxOpenComplaints": 10
}
```

### PUT `/users/:id`

Updates a user account.

### DELETE `/users/:id`

Deactivates a user account.

### GET `/users/agents`

Returns agent profiles with assigned complaints.

---

## Feedback APIs

### POST `/feedback/:complaintId`

Submits feedback for a resolved or closed complaint.

Allowed role:

- USER

Request body:

```json
{
  "rating": 5,
  "comment": "The complaint was resolved quickly."
}
```

### GET `/feedback`

Returns feedback list.

Allowed roles:

- ADMIN
- AGENT

### GET `/feedback/summary`

Returns feedback summary.

Allowed roles:

- ADMIN
- AGENT

---

## Dashboard API

### GET `/dashboard/stats`

Returns dashboard statistics based on role.

- USER gets own complaint stats
- AGENT gets assigned complaint stats
- ADMIN gets complete system stats
