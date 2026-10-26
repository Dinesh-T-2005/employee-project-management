# Employee & Project Management System

A runnable full-stack starter using React + Vite, custom CSS, Node.js + Express, REST APIs, and MySQL.

## Features
- Dashboard statistics
- Employee CRUD (name, email, phone, designation)
- Project CRUD (name, description, start/end dates, status)
- Many-to-many employee/project assignments
- Employee details page with assigned projects
- Search, status filters, and client-side pagination
- Form validation, delete confirmation modal, toast notifications
- Responsive sidebar and layout

## Requirements
- Node.js 18+
- MySQL 8+

## 1. Create the database
Run `server/schema.sql` in MySQL. This creates the `employee_project_management` database and tables.

## 2. Configure and start the API
```bash
cd server
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
npm run dev
```
API default: `http://localhost:5000/api`

## 3. Start the React app (new terminal)
```bash
cd client
npm install
npm run dev
```
Open the URL printed by Vite, usually `http://localhost:5173`.

## API routes
- `GET /api/dashboard`
- `GET /api/employees?search=&page=1&limit=10`
- `GET /api/employees/:id`
- `POST /api/employees` body: `{ name, email, phone, designation, projectIds: [] }`
- `PUT /api/employees/:id` same body
- `DELETE /api/employees/:id`
- `GET /api/projects?search=&status=`
- `GET /api/projects/:id`
- `POST /api/projects` body: `{ name, description, startDate, endDate, status }`
- `PUT /api/projects/:id` same body
- `DELETE /api/projects/:id`
- `PUT /api/employees/:id/projects` body: `{ projectIds: [] }`

## Notes
- The frontend uses `VITE_API_URL` from `client/.env` if set; otherwise it uses `http://localhost:5000/api`.
- Passwords/secrets belong in `.env`, never in source control.
- Add authentication/authorization, rate limiting, CSRF protections where applicable, and production logging before deploying this starter.
