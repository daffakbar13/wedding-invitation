# CLAUDE.md

Guidance for building in this repo, mainly for adding new invitation themes.

## What is core and what is a theme

- **Core** (`app/`, `components/`, `lib/`): routing, token lookup, the mobile-width column with
  the outside colour, the EN/ID language switch, the 3D check, the not-found page. A new
  theme must **never** need a change here. If it seems to, stop and ask.
- **Themes** (`themes/<id>/` and `public/themes/<id>/`): everything inside the column once an
  invitation is found: cover, opening animation, sections, 3D scenes, the theme's texts.
- **Registry** (`themes/registry.ts`): the list of selectable themes; one line per theme.
- **Data** (`data/`): sample invitation and attendees, same shape the API (WEDDIN-3) will
  return (`lib/types.ts`). Themes only read what they receive as props.

## The theme contract (`lib/theme.ts`)

A theme folder exports a `ThemeDefinition` as its default from `index.ts`:

```ts
{
  id: 'garden-arch',                 // folder name = settings.theme value
  name: 'Garden Arch',
  texts: { en: {...}, id: {...} },   // every UI text, same keys in both languages
  Loading,                           // light component shown while the theme loads
  Component: lazy(() => import('./GardenArch')),   // the invitation itself
}
```

`Component` receives `ThemeProps`:

| Prop | Meaning |
| --- | --- |
| `invitation` | couple, events, venue, couple-written texts (`Localized`), photos, settings |
| `guest` | the attendee whose link was opened (`guest.name` goes on the cover) |
| `lang` | current language, `'en'` or `'id'`; the core switches it without a reload |
| `t(key, vars)` | the theme's own texts in `lang`, `{name}` placeholders filled from vars |
| `has3d` | `false` without WebGL or with reduced motion on: render the non-3D fallback |

The core already renders the language switch (top right, sticky) and the column. The
theme starts below/behind it.

## Adding a theme

1. **Copy the folder.** Copy `themes/garden-arch/` to `themes/<new-id>/` (lowercase, dashes)
   and `public/themes/garden-arch/` to `public/themes/<new-id>/` if you keep its assets.
2. **Rename.** In `themes/<new-id>/index.ts` set `id: '<new-id>'` and `name`. Rename the CSS
   file to `<new-id>.css` and update its import. In the CSS, replace the scope classes:
   `.theme-garden-arch` → `.theme-<new-id>` (tokens) and `.ga` → a short prefix of your own
   (theme root; also in the components' `className`s). Rename `@keyframes` (`ga-*`) too.
   Update asset paths `/themes/garden-arch/...` → `/themes/<new-id>/...`.
3. **Register.** Add one line to `themes/registry.ts`:
   `import newTheme from './<new-id>';` and `[newTheme.id]: newTheme,` in `themes`.
4. **Select.** Set `settings.theme: '<new-id>'` on an invitation in `data/invitations.ts`
   (later: the admin setting, WEDDIN-4).
5. **Build the design.** Change the theme's components, CSS and `texts.ts`. Keep the rules below.
6. **Check.** `npm run typecheck && npm run lint && npm test && npm run build`, then open a
   sample link at 375 px and 1280 px wide, in EN and ID, and once with reduced motion on
   (or WebGL off).

## Rules for every theme

- **Two languages, always.** Every visible text and every `aria-label` comes from `t()` or a
  `Localized` value, so switching language changes all of it without a reload.
  `npm test` fails when a key is missing in one language. Couple-written texts come from
  `invitation.texts[key][lang]`; fall back to the theme's own `t(key)`.
- **Scope all CSS.** Every theme's stylesheet loads on every page. Tokens go on
  `.theme-<id>` (the column; the language switch reads `--switch-*` from there), everything
  else under the theme's root class. Prefix `@keyframes` with the theme's prefix.
- **Mobile column only.** Design for 375–430 px wide. Never style `body`, `html` or anything
  outside the column; the outside colour is the core's (`settings.outsideColor`).
- **3D is optional for the visitor.** Load React Three Fiber scenes with `lazy()` inside
  `Suspense`, only when `has3d` is true. With `has3d` false, render a still version: no canvas,
  no animation, every text visible (`.no3d` on the theme root is the pattern). The
  `prefers-reduced-motion` media query in the CSS is a second guard.
- **Use the kit** in `components/kit/` before writing your own: `useScrollReveal` (adds `.in`
  to `.reveal` elements in view), `useTilt` (phone tilt / pointer as `--tx`/`--ty`, plus
  `requestMotionPermission()` for iOS, called from the open tap), `useCountdown`.
- **Photos are optional.** Every photo slot needs a placeholder when its URL is missing.
- **Names, dates and places come from the invitation**, never hard-coded: initials from
  `shortName`, dates through `formatDayLong` / `formatTime` / `formatDateShort` in the
  invitation's `timeZone`.
- **Assets** go in `public/themes/<id>/`. Fonts: system stacks only, unless a licensed web
  font is added on purpose.

## Conventions

- TypeScript strict. Components, `app/` and `themes/` import with the `@/` alias; files in
  `lib/` and `data/` import each other with relative `.ts` paths so `node --test` can run them.
- Unit tests live next to the code as `*.test.ts` (Node's built-in runner). End-to-end tests
  are `e2e/<TICKET>.spec.ts` (Playwright, added by QA).
- Tokens in attendee links are 128-bit random base64url strings
  (`node -e "console.log(require('crypto').randomBytes(16).toString('base64url'))"`).
- Approved designs live in `design/<TICKET>/` with screenshots referenced on the ticket;
  build every state they show.
