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

### Server-side Conversions API (CAPI)
- **`PageView`**: Fires automatically for **every page request** via `middleware.ts` (runs on the server before the page renders)
- **`Lead`**: Fires when form submits to `/api/track-lead` (server proxies to Formspree + Facebook CAPI)

### How it works

1. User requests **any page** → `middleware.ts` fires CAPI `PageView` automatically
2. User submits signup form → `/api/track-lead` sends to Facebook CAPI **and** Formspree in parallel
3. On success, user redirects to `/thank-you` (middleware fires another `PageView`)

The `/api/track-lead` endpoint accepts all form fields:
```json
{
  "name": "Jane Doe",
  "age": "14",
  "parent_number": "5551234567",
  "experience": "None",
  "interests[]": ["Python", "Web Development"],
  "availability": "2024-01-15T10:00",
  "comments": "Excited to learn!",
  "email": "parent@email.com",
  "sourceUrl": "https://yoursite.com/signup"
}
```

### Deduplication
Each submission generates a unique `event_id` used for both client and server tracking. Facebook automatically deduplicates events with matching IDs.

