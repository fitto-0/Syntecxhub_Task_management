# Task Manager (MERN)

Full-stack task manager with JWT auth, Express/Mongo API, and React client.

## Stack
- Backend: Node.js, Express, MongoDB, JWT, bcrypt
- Frontend: React (Vite), Axios, React Router

## Setup

### Backend
```bash
cd server
npm install
cp env.example .env   # fill MONGO_URI and JWT_SECRET
npm run dev           # http://localhost:5000
```

### Frontend
```bash
cd client
npm install
npm run dev           # http://localhost:5173
```

Set `VITE_API_URL` in `client/.env` if the API URL differs (default `http://localhost:5000/api`).

## API
- `POST /api/auth/register` – email, name, password → token + user
- `POST /api/auth/login` – email, password → token + user
- `GET /api/tasks` – list user tasks
- `POST /api/tasks` – create (title, description?, status?, dueDate?)
- `PUT /api/tasks/:id` – update any fields
- `DELETE /api/tasks/:id` – remove task

All `/api/tasks` routes require `Authorization: Bearer <token>`.

## Notes
- Data scoped per authenticated user.
- Status values: `pending`, `in-progress`, `done`.
- Server uses `type: module`; adjust if your environment requires CommonJS.
