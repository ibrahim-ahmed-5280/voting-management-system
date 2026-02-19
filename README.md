# Election Management System (MERN)

Full-stack election management platform with:

- Admin portal: election/candidate/voter/vote management, live results, final results, profile management.
- Voter portal: assigned elections, vote casting, and result views.
- Backend security: session-based auth with single active session enforcement.
- Excel support: voter bulk import and vote report download.

## Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose), Express Session, Multer, ExcelJS/XLSX
- Frontend: React (Vite), Tailwind CSS, React Router, Framer Motion, Recharts

## Project Structure

- `backend/` Express API, models, controllers, routes, middleware
- `frontend/` React app with admin/voter pages and reusable components

## Environment Setup

1. Backend env:
   - Copy `backend/.env.example` to `backend/.env`
2. Frontend env:
   - Copy `frontend/.env.example` to `frontend/.env` (optional)

## Run Locally

1. Install backend dependencies:
   - `cd backend`
   - `npm install`
2. Install frontend dependencies:
   - `cd ../frontend`
   - `npm install`
3. Start backend:
   - `cd ../backend`
   - `npm run dev`
4. Start frontend:
   - `cd ../frontend`
   - `npm run dev`

Frontend runs at `http://localhost:5173`, backend at `http://localhost:5000`.

## Demo Roles / Login

Run:

- `cd backend`
- `npm run seed:demo`

This seeds:

- Admin: `admin@ems.com` / `admin123`
- Voter: `VOTER001` + `voter@ems.com`

Login pages:

- Admin: `http://localhost:5173/admin/login`
- Voter: `http://localhost:5173/voter/login`

## Key API Areas

- Auth: `/api/auth/*`
- Admin profile/registration: `/api/admin/*`
- Elections: `/api/elections/*`
- Candidates: `/api/candidates/*`
- Voters (admin + voter): `/api/voter/*`
- Votes: `/api/votes/*`
