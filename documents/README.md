# SCADA Field Dictionary (Al Gurg Automation and Controls)

Offline PWA covering DNP3 and Aveva Telemetry.

## Structure
- `database/terms.json` - hardcoded dictionary (single source, copied to `public/` at build)
- `src/js` - TypeScript core (types, store, utils, feedback, service worker source)
- `src/components` - card, detail, tour (pure functions returning escaped HTML)
- `src/css` - scoped, tokenised CSS (no inline styles)
- `backend`, `api` - optional token-protected API (`API_TOKEN=... npm start`)
- `tests` - Jest suite; `.github/workflows/ci.yml` - lint, test, build

## Run
```
npm install && npm run build
npx serve public
```
Add terms by editing `database/terms.json`.

## Shortcuts
`/` search, `D` dark, `F` focus, `Esc` back. Voice: "open <term>", "back".

## Not included yet
Cypress E2E tests, push notifications for firmware updates (needs a push server), a larger term set, PNG icons, a Sentry DSN (uncomment the meta tag in index.html).

## Adding terms
Add a new file such as `database/terms/003-aveva-historian.json` (array of term objects). `npm run build` merges all shards, rejects duplicate ids or missing fields, and regenerates `database/terms.json`.
