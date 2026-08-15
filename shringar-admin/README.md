# ✦ Shringar Admin Portal

A completely separate site from the customer-facing Shringar website — same backend, different application, different login, different port. Built so the shop owner can run the entire business (designs, artists, orders, analytics) without ever touching code.

## What's in here
| Page | What it does |
|---|---|
| `login.html` | Admin sign-in. Uses the same `/auth/login` endpoint as the customer site, but rejects any account that isn't `ROLE_ADMIN`. |
| `dashboard.html` | Total orders, total order value, total advance received, balance pending, order-status breakdown, and a **Most Clicked Designs** table — the popularity data that determines what shows first on the public homepage. |
| `designs.html` | Full design management — add, edit, soft-delete/restore. Upload a cover photo + gallery images, set tags, recommended skin tones (drives the AI Try-On matching), pricing, duration, featured flag. |
| `artists.html` | Full artist management — add, edit, soft-delete/restore. Upload a profile photo + portfolio images, service areas, Instagram/YouTube links, and the artist's notification email. |
| `orders.html` | Every booking ever placed, paginated, filterable by status, with customer contact info, artist, totals, and advance-payment status. |

## How it connects to the website — no code changes needed
Every action here (adding a design, removing an artist, etc.) hits the **same live backend** the customer site uses. The moment you save a design here, it appears on the public homepage on its next page load — there is no rebuild, no redeploy, no file to edit. Soft-deleting a design or artist makes it disappear from the public site instantly while keeping past order history intact (so old receipts still show what was actually booked).

The "Most Clicked Designs" table reflects real click data: every time a customer opens a design's detail page on the live site, that design's click count increments automatically (`POST /api/designs/{id}/click`). The public homepage's main grid is sorted by that same click count by default (`GET /api/designs?sortBy=popularity`) — so popular designs surface first **automatically**, with zero admin action required.

## Setup

### 1. Point it at your backend
Open `js/admin-api.js` and confirm `API_BASE` matches where your Spring Boot backend is running (default `http://localhost:8080/api`).

### 2. Run it as its own site
This is deliberately a separate origin from the customer site — serve it on a different port:
```bash
cd shringar-admin
python3 -m http.server 5501
```
Then visit **http://localhost:5501**. The backend's CORS config already allows `http://localhost:5501` and `http://127.0.0.1:5501` out of the box.

### 3. Get an admin account
Sign up as a normal customer on the **customer-facing site first** (`shringar-frontend`), then promote that account to admin via SQL — see the backend README's "Making Yourself an Admin" section:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@email.com';
```
Log out and back in (here, on the admin portal) so the new JWT carries `ROLE_ADMIN`.

## Session isolation
This portal stores its JWT under a different `localStorage` key (`shringar_admin_token`) than the customer site (`shringar_token`) — even if you somehow ran both on the same origin, an admin session and a customer session would never collide or leak into each other.

## What's deliberately left out (for now)
- **Site settings management** (Instagram/YouTube/WhatsApp footer links, admin notification email list) — these currently live in `SiteSettings`/`application.properties` and are edited directly in the database or config file. A `settings.html` page following the same CRUD pattern as `designs.html` would be the natural next addition.
- **Coupon management** — coupons are seeded via `data.sql` today. A dedicated CRUD page would follow the identical pattern already established here.
- **Manual sort-order curation UI** — `sortOrder` is editable per-design in the edit modal, but there's no drag-and-drop reordering view yet; the popularity-based sort (`?sortBy=popularity`) is what actually drives the public homepage by default.
