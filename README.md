# Eldar Nebolsin — official website

Source for the official Eldar Nebolsin website, prepared for Cloudflare Workers.

## Build

```bash
npm ci
npm run build
```

The private administration panel uses two Cloudflare bindings:

- D1 database binding: `DB`
- R2 bucket binding: `BUCKET`

Apply `drizzle/0000_condemned_jackpot.sql` to the D1 database.

Protect `/admin/*` and `/api/admin/*` with Cloudflare Access, allowing only
`nebolsineldar@hotmail.com`. The application verifies the authenticated email
header supplied by Cloudflare Access.

The public website remains available before the optional administration
bindings are configured.
