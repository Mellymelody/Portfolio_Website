# Portfolio Website — Chibuike Louis

Static portfolio (HTML/CSS/JS) deployed on Netlify, with a serverless
contact form backed by Supabase + Resend.

## Pages

- `index.html` — Home / About / Services / Portfolio / Contact (hash-routed SPA sections)
- `service-web-design.html`, `service-web-development.html`, `service-ui-ux.html`,
  `service-graphic-design.html`, `service-seo.html`, `service-digital-marketing.html`
- `success.html` — fallback thank-you page

## Local dev

```bash
npm install
npm run dev   # netlify dev (serves static files + functions)
```

Copy `.env.example` to `.env` for local function runs. Real keys live in
Netlify Dashboard > Site Settings > Environment Variables — never commit `.env`.

## Environment variables

| Var | Required | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | yes | Supabase anon key |
| `RESEND_API_KEY` | yes | Resend API key |
| `CONTACT_TO_EMAIL` | no | Recipient (default `princelouis558@gmail.com`) |
| `CONTACT_FROM_EMAIL` | no | Verified sender (default Resend onboarding address, which only delivers to the account owner) |

## Supabase table

```sql
create table contact_submissions (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz default now()
);
```

Enable Row Level Security and only allow inserts via the anon key
(or route inserts through a service-role function) per your threat model.

## Contact function (`netlify/functions/contact.js`)

- `POST /.netlify/functions/contact` with JSON `{ name, email, subject, message }`
- Validates lengths + email format, strips `<>`, caps field sizes
- Honeypot field `website`: bots that fill it get a fake success, nothing stored
- Best-effort in-memory rate limit: 5 submissions / IP / 10 min
  (serverless instances are ephemeral — use Redis/Upstash for strict limits)
- CORS preflight (`OPTIONS`) handled; `replyTo` set to the visitor

## Deploy

Push to `main`; Netlify builds with `npm install`, publishes `.`,
functions from `netlify/functions`.
