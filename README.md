# codeabode

Static site deployed on Netlify (recommended) so we can use Netlify Functions for Meta Conversions API.

## Netlify setup

- **Publish directory**: repo root (`.`)
- **Functions directory**: `netlify/functions` (configured in `netlify.toml`)

### Required environment variables (Netlify → Site settings → Environment variables)

- `META_PIXEL_ID`: your Meta Pixel ID (e.g. `2975988395923366`)
- `META_ACCESS_TOKEN`: Conversions API access token (**do not commit this**)

Optional:

- `META_TEST_EVENT_CODE`: Meta Events Manager “Test Events” code (lets you verify CAPI events immediately)

## Events implemented

- **Client-side Pixel**: `PageView` on load, `Lead` on `signup.html` form submit
- **Server-side (CAPI)**: `Lead` via `/.netlify/functions/track-lead` (deduplicated with shared `event_id`)

