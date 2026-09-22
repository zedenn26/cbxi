# Cubixtop India

Production-oriented Next.js + Supabase starter based on the requested Cubixtop CMS specification. The visual direction is original and inspired by the large-type, editorial corporate layout of the supplied Konstruktion reference; no proprietary theme code/assets are included.

## Setup
1. Create a Supabase project.
2. Run `supabase/migrations/001_cubixtop.sql` in Supabase SQL Editor.
3. Copy `.env.example` to `.env.local` and fill the keys. Keep the service role key server-only.
4. In Supabase Authentication create `info@cubixtop.com` with a NEW strong password. Do not commit a password.
5. Insert that auth user's UUID into `profiles` with role `ADMIN`.
6. `npm install` then `npm run dev`.

## Admin security
The password supplied in chat is intentionally NOT embedded. Rotate it before production. Supabase Auth should own the credential. RLS policies protect CMS/private tables. The starter includes the database model and public experience; complete CRUD screens can be expanded against the same schema.

## Deploy
Push to GitHub, import into Vercel, add the four environment variables, and deploy. Set `NEXT_PUBLIC_SITE_URL` to the production domain.

## Website administration

Set `ADMIN_PASSWORD` in `.env.local` to a private password of at least 12 characters and restart `npm run dev`. Open `/admin` and sign in. No Supabase Auth user is required for this password-based admin. Changing the password invalidates existing sessions. Sessions expire after eight hours.

The editor manages public page text, image URLs and descriptions, services (add/edit/hide/order), and the latest 100 enquiries with status updates. Press **Save & publish changes** to persist page edits. Changes are stored in the existing `site_settings` table; no additional SQL migration is needed. Service content uses the existing `services` table. Keep the Supabase service-role key server-only.

The public phone number is +91 9481 317 929. The floating WhatsApp button opens a chat with this number. Contact and service enquiry buttons open a modal form.

Production login and enquiry limits use the existing Supabase database; Redis is not required. Configure the required deployment variables before launching; see DEPLOYMENT.md.

Production deployment and mail setup: see [DEPLOYMENT.md](DEPLOYMENT.md).
