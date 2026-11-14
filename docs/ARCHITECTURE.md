# Architecture and operations

The React/Vite frontend calls an Express JSON API through `/api`. Development
uses Vite's proxy; production Express serves the built frontend and SPA routes.
Mongoose persists users, hashed session tokens, expiring email challenges,
vitals, and reports in MongoDB. There is no dependency on the reference clone
at runtime and no copied Next.js or Redux code.

## Accounts and private records

Passwords use Node's scrypt with per-password random salts. Session cookies are
HTTP-only and SameSite=Strict; production adds Secure. MongoDB stores only a
SHA-256 hash of each random 256-bit session token. Sessions expire after seven
days, and middleware checks expiry directly as well as using TTL cleanup.
Password resets invalidate all sessions. Password changes issue a new session
and revoke older sessions.

Verification and reset codes expire after ten minutes, allow five attempts, and
are consumed once. Resends have a one-minute cooldown. Codes use salted scrypt
hashes and are excluded from default queries. The development console-mail mode
prints codes to the API terminal; production requires SMTP.

All data queries include the authenticated user's ID. File downloads require
the same ownership check. Avatars are private raster images. Reports are
downloaded as attachments with no-store and nosniff headers. JSON bodies and
uploads are bounded, and mutating endpoints require a custom header and check
browser Origin. Helmet, CORS, and rate limits are enabled.

Rate limits are in-process; production runs one API instance by default. A
multi-instance deployment should supply a shared rate-limit store. If one
trusted reverse proxy fronts Express, set `TRUST_PROXY=1`; do not set this for
a directly exposed server or an untrusted/multiple-proxy network.

## Report explanations

Google Gemini is optional and called only on explicit per-report consent.
The API sends only that report file and a constrained explanation prompt. It
validates the resulting JSON before persisting English/Roman Urdu text and
questions. Provider errors remain generic and original files remain available.
No report content or provider key is logged. Output is rendered as escaped text.
Explanations are informational and require review against the original report.

## Deployment

1. Configure a persistent MongoDB service, SMTP service, and HTTPS domain.
2. Build the frontend (`npm run build`).
3. Set `NODE_ENV=production`, `CLIENT_URL=https://your-domain.example`,
   `MONGO_URI`, `MAIL_MODE=smtp`, `SMTP_HOST`, and your SMTP credentials.
4. Start with `npm start` behind HTTPS. The Express server serves both API and SPA.
5. Check `/api/health`. Persist and back up MongoDB; report files live in the database.

Alternatively build `docker build -t healthpal .` and supply the environment via
`docker run --env-file <production-env-file> -p 5000:5000 healthpal`. The supplied
Dockerfile runs the app as the non-root Node user. Container execution is not
part of the local validation unless Docker is available.

Do not commit environment files or use development/test mail endpoints in a
deployed service. The test harness under `backend/scripts/browser-server.mjs`
is separate from `src/server.js` and starts only for browser tests.
