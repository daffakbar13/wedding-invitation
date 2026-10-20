# Wedding invitation API

Express (TypeScript) + MongoDB Atlas. One modular API: `auth`, `owners`, `invitations`, `attendees`, `public`.

## Run

Needs Node 22.18+ (runs the TypeScript directly; `npm run build` emits JS to `dist/`).

```bash
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID, SEED_*
npm install
npm run seed           # platform admin + sample couple (Daffa & Alvina) + 4 attendees
npm run dev            # http://localhost:4000
```

## Accounts and roles

- **Platform admin** — created by `npm run seed` from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. Manages owners.
- **Owner** — created by the platform admin only (no self sign-up), with one invitation each. Can read and change only their own invitation and attendees.

Sign-in returns a bearer token: send `Authorization: Bearer <token>`. Every request reloads the account, so a disabled owner loses access at once.

Google sign-in: the admin screens get an ID token from Google Identity Services and post it to `/api/auth/google`. The API checks it against `GOOGLE_CLIENT_ID` and only lets in an email that is already registered.

## Endpoints

| Method | Path | Who | |
|---|---|---|---|
| POST | `/api/auth/login` | anyone | `{ email, password }` → `{ token, account, invitationId }` |
| POST | `/api/auth/google` | anyone | `{ idToken }` → same; unregistered email → 403 |
| GET | `/api/auth/me` | signed in | `{ account, invitationId }` |
| GET | `/api/owners` | admin | owners with their theme and invitation id |
| POST | `/api/owners` | admin | `{ name, email, password?, theme? }` — creates the owner and their invitation |
| PATCH | `/api/owners/:id` | admin | `{ name?, active?, password?, theme? }` |
| GET | `/api/invitations/:id` | admin, its owner | settings |
| PUT | `/api/invitations/:id` | admin, its owner | full settings save (see below) |
| GET, POST | `/api/invitations/:id/attendees` | admin, its owner | list / add `{ name, group?, phone? }` |
| PATCH, DELETE | `/api/invitations/:id/attendees/:attendeeId` | admin, its owner | edit / remove |
| GET | `/api/public/invitations/:token` | anyone | `{ invitation, attendee: { name } }`; unknown token → 404 |

Errors are `{ "error": "<message>" }` with a 4xx/5xx status.

### Invitation settings

```json
{
  "defaultLang": "en",
  "outerColor": "#FFFFFF",
  "colors": { "primary": "#8A6D3B", "accent": "#C9A86A" },
  "groomName": "…", "brideName": "…",
  "weddingAt": "2027-02-13T08:00:00+07:00",
  "venueName": "…", "mapUrl": "https://…",
  "texts": {
    "en": { "invitedLine": "…", "greetTitle": "…", "greetBody": "…", "quote": "…", "thanksBody": "…", "venueAddr": "…" },
    "id": { "…": "same keys" }
  }
}
```

Every text is required in both English and Indonesian. When one is missing nothing is saved and the API answers 400, for example `{ "error": "Missing in Indonesian: Quote.", "missing": [{ "lang": "id", "field": "quote" }] }`.

### Attendee links

Each attendee gets a random 128-bit token (22 URL-safe characters) when added; the personal link is `<site>/i/<token>`. The token is the only key to the public endpoint. An unknown token and the invitation of a disabled owner both return 404.
