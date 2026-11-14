# HealthPal

A MERN personal health organizer built from a clean scaffold, with the local HealthMate-Ai-Integration clone used as a reference for feature scope. The frontend uses React and Vite; the API uses Express, Node.js, MongoDB, and Mongoose.

## Features

- Signup, email verification, login, logout, and persistent private sessions
- Password recovery and password changes with session revocation
- Personal and health profiles, including private profile photos
- Vitals journal: blood pressure, glucose, weight, pulse, notes, edit/delete, and charts
- Private PDF/image report uploads, search, pagination, downloads, and deletion
- Optional consent-based Gemini explanations in English and Roman Urdu
- Personal dashboard, report history, and AI insights library
- Responsive layouts, loading/error/empty states, keyboard navigation, and exact chart data

## Start locally

Prerequisites: Node.js 22.12+ (Node 24 used for validation) and local MongoDB or a MongoDB Atlas connection.

```powershell
npm run setup
Copy-Item backend/.env.example backend/.env
```

Edit `backend/.env` and set `MONGO_URI`. Then start MongoDB and run:

```powershell
npm run dev
```

Open http://localhost:5173. The API runs at http://localhost:5000. Development verification/reset codes appear in the API terminal (`MAIL_MODE=console`). No email account is required for local development.

Gemini is optional: set `GEMINI_API_KEY` in `backend/.env` and restart the API to enable report explanations. Uploads and downloads work without it. A report is sent to Google only after the user checks the consent box and requests analysis.

## Verification

```powershell
npm test
npm run build
npm run browser:install
npm run test:e2e
npm run format:check
```

API integration tests use an ephemeral MongoDB process, not your configured database. On the first run, mongodb-memory-server downloads MongoDB into `backend/.cache`. Browser tests launch their own API and Vite servers, use an isolated database and captured development mail, and replace Gemini with a deterministic test response. They cover signup, verification, profile persistence, vitals editing, report upload/download, AI consent, bilingual explanations, mobile navigation, and logout. Live SMTP and Gemini delivery require your own credentials and are not exercised by these automated tests.

Browser installation downloads Chromium into `.cache/playwright`. Keep ports 5000 and 5173 free while running browser tests. Screenshots/traces appear under `frontend/test-results` when generated. No patient data, browser binaries, test databases, or secrets are committed.

## Production

`npm run build` creates the frontend bundle. With `NODE_ENV=production`, `npm start` serves both the bundle and API. Production requires an HTTPS `CLIENT_URL`, MongoDB, and SMTP configuration. A Dockerfile and GitHub Actions verification workflow are included.

See [API routes](docs/API.md), [architecture and deployment](docs/ARCHITECTURE.md), and [implementation milestones](docs/BUILD_PLAN.md).

## Reference and history

Feature reference: https://github.com/G-Mustafa1/HealthMate-Ai-Integration at commit `ac5f8c5`. The original local clone is preserved separately. This repository implements the MERN version anew; no claim is made that the upstream project was authored here.

The Git history groups implementation milestones across a retrospectively assigned November 1–14, 2026 schedule. AI explanations are informational, may be inaccurate, and do not replace professional medical care.
