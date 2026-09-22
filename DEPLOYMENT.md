# Cubixtop production deployment

Canonical website: **https://www.cubixtop.com**. This is a Next.js server application, not a static export.

## Required configuration

Set these environment variables in Vercel **Production**. Keep passwords and service-role keys server-only. Do not commit `.env.local` or upload it as a public asset.

- `NEXT_PUBLIC_SITE_URL=https://www.cubixtop.com`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: existing Supabase project.
- `ADMIN_PASSWORD`: private admin password (12+ characters).
- `ADMIN_SESSION_SECRET`: random secret (32+ characters); changing it invalidates admin sessions.
- `ZOHO_SMTP_HOST`: exact outgoing host from Zoho Mail → Settings → Mail Accounts → Server Configuration. This depends on account region and plan; do not guess it.
- `ZOHO_SMTP_PORT=465` for implicit TLS, or `587` for STARTTLS.
- `ZOHO_SMTP_USER=info@cubixtop.com`
- `ZOHO_SMTP_PASSWORD`: Zoho app-specific password where required.
- `CRON_SECRET`: random secret (32+ characters), supplied to Vercel Cron automatically as a Bearer token.

Local fields are in `.env.local`. Run `npm run check:deployment` to check configuration, database access and SMTP authentication. It does **not** send an email. Run a clearly labelled real test enquiry after deployment, then confirm its arrival in info@cubixtop.com; successful SMTP acceptance does not establish inbox placement.

## Deploy

1. Import this project into your Vercel account using a private repository, or run the official Vercel CLI from this project folder and link the intended project.
2. Choose Next.js and Node.js 22.x or 24.x. Install with `npm ci`; build with `npm run build`. Do not use static export.
3. Add the production variables above. Use a separate database/mail account for previews when possible; preview metadata and robots are configured not to index.
4. Deploy and add `www.cubixtop.com` and `cubixtop.com` under Domains. Redirect the apex domain to `https://www.cubixtop.com`.
5. Apply only the web DNS records Vercel shows. **Preserve Zoho MX, SPF and DKIM records** so business email continues to work. Check SPF/DKIM/DMARC in Zoho Admin before changing email-related DNS.
6. Verify HTTPS, `/admin`, `/contact`, a real email enquiry, `/robots.txt`, and `/sitemap.xml` on the custom domain.

## Enquiry delivery and operations

Enquiries are stored in Supabase, then queued in the existing RLS-protected `site_settings` table with `setting_group=enquiry_mail`. No mail-specific database migration is needed. Email has a fixed recipient, info@cubixtop.com, and the visitor's validated address is Reply-To. SMTP uses TLS and sends plain text.

Delivery is attempted immediately. Failed deliveries stay pending, are visible in the admin mail queue, and can be retried there. Vercel Cron retries up to 10 pending messages daily at 03:00 UTC (08:30 IST). This schedule is compatible with daily cron plans; increase frequency only if the selected Vercel plan supports it. Monitor pending items: daily retries are not immediate recovery. Atomic Supabase row updates prevent concurrent sends; a crash after SMTP acceptance and before status persistence can result in a duplicate. The stable message reference helps identify duplicates. If the database queue write itself fails, the endpoint reports failure; review saved enquiries and manually follow up.

## SEO submission

- Verify the domain in Google Search Console and Bing Webmaster Tools using the DNS records each service provides.
- Submit `https://www.cubixtop.com/sitemap.xml` in both tools.
- Request indexing of the homepage and primary service pages after they are live.
- Crawl frequency, inclusion and rankings are controlled by search engines. Immediate indexing across all engines cannot be guaranteed.
- Location copy describes remote team locations, not physical offices; no invented street addresses or office listings have been added.

## Security verification and limits

Dependency audit and build results cover the installed version at testing time, not all possible vulnerabilities. Re-run `npm audit`, keep dependencies patched, monitor logs, and periodically review Supabase access policies and backups. Public enquiry and admin login endpoints use persistent production rate limits, bounded request bodies and origin validation; admin sessions use signed HttpOnly cookies. Private routes return noindex/no-store headers. The CSP allows inline scripts/styles needed by this implementation; a future nonce-based policy can tighten this further. Enquiry email credentials and production Vercel access must be configured and tested before launch.

## Verified in this workspace

- Next.js upgraded from 16.0.0 to 16.3.5. `npm audit`: zero reported vulnerabilities after the upgrade.
- `npm run build`: passed.
- `node --env-file=.env.local tests/production-smoke.mjs`: 18 production security/SEO checks passed, without submitting enquiries or sending emails.
- Anonymous database reads returned no rows for enquiries, settings, profiles and notes.
- Zoho SMTP authentication and database preflight passed. A labelled website test enquiry was accepted by Zoho for info@cubixtop.com. Inbox placement still needs recipient confirmation. Vercel project access has not been supplied.

## Supabase-only security guards

No Redis account or additional database migration is required. Rate limits use atomic compare-and-swap updates in the existing RLS-protected `site_settings` table (`request_limits` group). Mail sends acquire a 120-second lease on their queue row in the same database. All changes use the server-only service-role client. Database errors fail closed. The authenticated cron clears rate-limit records older than 24 hours. Run `node --env-file=.env.local tests/database-guards.mjs` to verify concurrent requests and expired lock recovery; the test cleans up its own records and does not send email.
