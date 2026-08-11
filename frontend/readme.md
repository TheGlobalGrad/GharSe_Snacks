# GharSe Snacks

GharSe Snacks is a regional dry-snack storefront concept for the brand tagline: "Ghar ki Yaad. Ghar ka Swad."

## Included features
- Landing page for the brand story and launch buzz
- Product cards for regional snacks
- Cart, GST-aware checkout, and order storage in browser localStorage
- Login/signup modal and user persistence
- Partner interest form
- Email/updates subscription form
- SEO support files: robots.txt, sitemap.xml, manifest.json

## Files
- index.html — main website structure
- style.css — visual styling and responsive layout
- script.js — product catalog, cart, auth, forms, and toast feedback
- favicon.ico — placeholder icon file
- robots.txt — crawler instructions
- sitemap.xml — sitemap entries
- manifest.json — PWA manifest

## Next steps
- Replace placeholder content with real images and brand photography.
- Configure the email notification service below so partner and subscriber forms notify the GharSe Snacks team.
- Complete the Razorpay test and go-live steps below before accepting real orders.
# GharSe Snacks storefront

## Razorpay setup

1. Install Node.js 18 or later, then copy `.env.example` to `.env`.
2. In Razorpay Dashboard, create Test Mode API keys and add them to `.env`. Never put `RAZORPAY_KEY_SECRET` in `script.js`, HTML, or Git.
3. Run `npm start` and open `http://localhost:3000` (do not open `index.html` directly).
4. Make a Razorpay test payment, verify it appears in the Razorpay Dashboard, then configure webhooks and automatic capture before using live keys.

The server calculates order totals from its own product catalog, creates a Razorpay Order for each checkout, and verifies the returned HMAC signature before confirming the order.

## Team email notifications

Partner-interest and mailing-list submissions are saved by the server and notify `gharse.team@gmail.com` when `RESEND_API_KEY` and `EMAIL_FROM` are set in `.env`. The `EMAIL_FROM` address must use a domain verified with your email service; the Gmail address remains the notification recipient.
