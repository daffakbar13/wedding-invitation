# Wedding Invitation

Digital wedding invitations with 3D themes. Each couple (owner) has one invitation; each
attendee gets their own link with an unguessable token. Every invitation is shown in a
mobile-width column on every screen size, in English and Indonesian.

This repo is the front end (FE). The API, database and login come in WEDDIN-3 and the admin
areas in WEDDIN-4. Until then the FE runs on the sample data in `data/`.

## Stack decision

| Part | Choice | Launch hosting |
| --- | --- | --- |
| FE | Next.js 15 (App Router, React 19, TypeScript) + React Three Fiber (three.js) | Vercel |
| BE | Node.js + Express: one modular API (no microservices yet), in its own repo/service | Render |
| Database | MongoDB Atlas | Atlas free cluster (M0) |

**Why these fit**

- **Next.js on Vercel.** Vercel is built by the Next.js team, so deploys need no
  configuration, and its free tier covers a launch-sized audience. Server rendering gives each
  invitation link a proper title for chat previews (WhatsApp, Telegram).
- **React Three Fiber.** It drives three.js from React components, so a theme's 3D scenes
  (falling petals, gold rings) sit next to its normal markup. Each theme's 3D code is
  lazy-loaded into its own chunk, so one theme's weight never slows another.
- **Express API, separate from the FE.** Most logic lives in the FE themes, so the API stays
  small: invitations, attendees, settings, auth. A separate service keeps the FE host free of
  long-running server code, and moves to a VPS unchanged. Modules are folders inside one API
  (`invitations`, `guests`, `auth`, …), not separate services.
- **MongoDB Atlas.** Invitations are nested documents (couple, events, texts in two languages,
  theme settings), which fit a document database without joins. The free M0 cluster
  (512 MB) is plenty for launch.
- **Render for the API.** Its free tier runs a normal Node.js server (Vercel's free tier only
  runs functions).

**Known limits of the free launch**

- Render's free service sleeps after about 15 minutes idle; the first request after that takes
  a few extra seconds. The FE works from its own data while the API wakes up, or the paid tier
  removes the sleep.
- Vercel's free (Hobby) plan is for non-commercial use. Once couples pay for invitations, move
  the FE to Vercel Pro or to the VPS below.

**Later: Hostinger VPS.** Shared web hosting cannot run Node.js servers, so the move is to a
Hostinger VPS (not done in this ticket):

1. FE: `next build`, then `next start` (or `output: 'standalone'`) under PM2, behind Nginx with
   HTTPS (Let's Encrypt).
2. API: the same Express service under PM2 on the same VPS, behind the same Nginx, on its own
   path or subdomain.
3. Database: stay on MongoDB Atlas (nothing to move), or run MongoDB on the VPS later.
4. Point the domain's DNS at the VPS and set the FE's API URL to the new address.

No code changes are needed for the move: both apps already run as plain Node.js processes.

## Run it

Requires Node.js 22.18 or newer.

```bash
npm install
npm run dev
```

Open a sample attendee link, e.g. <http://localhost:3000/i/zrOXKCOCTHII0277hRFFQA>. The
other sample tokens are in `data/guests.ts`. Any other link shows "Invitation not found".

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (`node --test`, no extra framework) |

## Layout

```
app/                 routes: /i/[token] (invitation), not-found
components/          core: InvitationShell, Column, LanguageSwitch, NotFound
components/kit/      hooks themes may reuse: scroll reveal, tilt, countdown
lib/                 types, i18n, data lookup, theme contract, 3D check
data/                sample invitation and attendees (replaced by the API in WEDDIN-3)
themes/registry.ts   the list of selectable themes
themes/<id>/         one folder per theme
public/themes/<id>/  a theme's static assets (SVG, images)
design/              approved design mockups, per ticket
```

## Themes

A theme is selected per invitation by `settings.theme`. To add one, follow
[CLAUDE.md → Adding a theme](CLAUDE.md#adding-a-theme). The first theme is **Garden Arch**
(`themes/garden-arch`): a photo cover with a 3D envelope; "Open Invitation" opens the envelope,
then curtains part onto the couple photo with falling petals and spinning gold rings. Devices
without WebGL, or with reduced motion on, get a still version with the same content.
