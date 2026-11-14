# API contract

All endpoints are under `/api`. JSON writes require `Content-Type: application/json`
and `X-HealthPal: 1`. Multipart uploads also require `X-HealthPal: 1`.
Browser clients send the HTTP-only session cookie with `credentials: include`.
Errors return `{ message, details? }`; credentials and report file contents never
appear in list or detail responses.

| Method           | Path                        | Purpose                                                               |
| ---------------- | --------------------------- | --------------------------------------------------------------------- |
| GET              | `/health`                   | Database availability and configured AI/development-mail capabilities |
| POST             | `/auth/signup`              | `{ name, email, password }`; creates an unverified account            |
| POST             | `/auth/verify-email`        | `{ email, code }`; verifies and starts a session                      |
| POST             | `/auth/resend-verification` | `{ email }`; resend with a 60-second cooldown                         |
| POST             | `/auth/login`               | `{ email, password }`; verified users only                            |
| GET              | `/auth/me`                  | Current user                                                          |
| POST             | `/auth/logout`              | Revoke current session                                                |
| POST             | `/auth/forgot-password`     | `{ email }`; generic response to unknown accounts                     |
| POST             | `/auth/reset-password`      | `{ email, code, password }`; revoke all sessions                      |
| POST             | `/auth/change-password`     | `{ currentPassword, password }`; revoke other sessions                |
| GET, PUT         | `/profile`                  | Read or replace allowed profile fields                                |
| GET, PUT, DELETE | `/profile/avatar`           | Private avatar; PUT multipart field `file`, max 512 KB                |
| GET, POST        | `/vitals`                   | List or create a measurement                                          |
| PUT, DELETE      | `/vitals/:id`               | Edit or delete an owned measurement                                   |
| GET, POST        | `/reports`                  | List or upload a report                                               |
| GET, DELETE      | `/reports/:id`              | Read metadata/analysis or delete report and file                      |
| GET              | `/reports/:id/file`         | Download owned original file as an attachment                         |
| POST             | `/reports/:id/analyze`      | `{ consent: true }`; send the file to Gemini                          |
| GET              | `/dashboard`                | Counts, recent reports, most recent vital, latest 20 entries          |
| GET              | `/dashboard/insights`       | Paginated analyzed reports                                            |

All profile, vitals, reports, and dashboard routes require authentication.
Pagination uses `page` (1-based) and `limit` (1–100), returning
`{ items, total, page, pages }`. Reports additionally accept `search` by title.

Profile PUT: `{ name, profile: { phone, gender, dateOfBirth, country, city,
bloodGroup, allergies, conditions } }`. Optional string fields can be empty.
Email cannot be edited through this endpoint.

Vitals POST/PUT: `{ systolic?, diastolic?, glucose?, weight?, pulse?, measuredAt,
note? }`. Numbers use mmHg, mg/dL, kg, and bpm. Send ISO timestamps for
`measuredAt`; omitted measurements use `null`. Blood pressure requires both
values. At least one measurement is required. Numeric limits are input bounds,
not clinical reference ranges.

Report POST is multipart: `file`, `title`, `category`, `reportDate`. Accepted
categories: Laboratory, Imaging, Prescription, Other. File limit: 10 MB; formats:
PDF, PNG, JPEG, WebP. File signatures are checked. Files are stored as private
MongoDB binary fields, excluded from normal queries and API serialization.

Report states: uploaded → analyzing → ready, not_medical, or failed. A provider
failure does not delete the original. An analysis older than two minutes can be
retried after a worker crash. No report is submitted to an AI provider on upload.
