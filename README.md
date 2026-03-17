# codeabode

Next.js (App Router) site deployed on Netlify so we can use server routes for Meta Conversions API.

## Netlify setup

- Netlify will run `npm run build` and use `@netlify/plugin-nextjs` (configured in `netlify.toml`).

### Required environment variables (Netlify → Site settings → Environment variables)

- `META_PIXEL_ID`: your Meta Pixel ID (e.g. `2975988395923366`)
- `META_ACCESS_TOKEN`: Conversions API access token (**do not commit this**)

Optional:

- `META_TEST_EVENT_CODE`: Meta Events Manager “Test Events” code (lets you verify CAPI events immediately)

## Events implemented

- **Client-side Pixel**: `PageView` (initial + SPA route changes), `Lead` on `/signup` form submit
- **Server-side (CAPI)**: `Lead` via `POST /api/track-lead` (deduplicated with shared `event_id`)

