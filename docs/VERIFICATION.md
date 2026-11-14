# Local verification

The completed MERN implementation was checked with Node.js 24 on Windows.

- `npm test`: 16 passing tests, including the database-backed account and private
  health-data journey. MongoDB runs in an isolated temporary instance.
- `npm run test:e2e`: passing Chromium desktop/mobile journey covering signup,
  verification, profile persistence, vitals creation/editing, private report
  upload/download, explicit AI consent, bilingual explanations, insights,
  responsive navigation, logout, and protected-route redirects.
- `npm run build`: frontend production build passed.
- `npm run format:check`: all matched files follow Prettier formatting.
- `git diff --check`: no whitespace errors.

The AI provider is replaced by a deterministic fixture in browser tests and by
a request mock in the AI unit test. Live Gemini and SMTP delivery have not been
tested with personal credentials. Production container execution and the hosted
GitHub Actions run are not covered by these local checks.

Browser tests explicitly stop both test servers on completion. Test-only mail,
provider fixtures, and shutdown endpoints are isolated from the production app.
