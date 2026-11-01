# HealthPal

A basic MERN skeleton: MongoDB and Mongoose, an Express API on Node.js, and a React frontend built with Vite.

This is a fresh scaffold. The existing `HealthMate-Ai-Integration/` reference clone stays local and is excluded from this repository.

## Local setup

Use Node.js 22.12 or newer and a local MongoDB instance or MongoDB Atlas connection.

1. Run `npm run setup` from the repository root.
2. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI`.
3. Start MongoDB, then run `npm run dev`.
4. Open http://localhost:5173. The API runs on http://localhost:5000.

The frontend proxies `/api` to the local backend. Run `npm run build` for the frontend production bundle, `npm run test` for API smoke tests, and `npm start` to run the API without watch mode. Production frontend hosting and routing to `/api` must be configured separately.

## Structure

- `frontend/src/`: React app and styles
- `backend/src/app.js`: Express middleware and routes
- `backend/src/server.js`: database connection and HTTP startup
- `backend/src/config/`: MongoDB connection
- `backend/src/models/`: starter Mongoose models
- `backend/src/routes/`: API routes

`GET /api/health` reports API and database availability. The API starts only after MongoDB connects.

Authentication, report uploads, AI analysis, and vitals tracking are future work; the interface labels these as planned features. No patient data endpoints are exposed by this skeleton.

Commits record the actual creation of this scaffold, using their real timestamps.

