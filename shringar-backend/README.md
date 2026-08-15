# ✦ Shringar Backend — मेहंदी कला

Spring Boot REST API powering the Shringar mehendi-artist booking platform (designs, cart, coupons, location-based booking, Razorpay payments).

## Tech Stack
- Java 17, Spring Boot 3.2 (Web, Data JPA, Security, Validation, Mail)
- MySQL 8
- JWT authentication (jjwt)
- Razorpay Java SDK for the 30% advance / 70% balance payment flow
- Maven

## Project Structure
```
src/main/java/com/shringar/
├── ShringhamApplication.java      Entry point
├── config/SecurityConfig.java     CORS + JWT filter chain
├── model/                         JPA entities (User, Design, Artist, City, Area,
│                                   Cart, CartItem, Coupon, Booking, BookingItem, Payment)
├── model/enums/                   Role, BookingStatus, OrderStatus, PaymentStatus,
│                                   CouponType, PreferredTime
├── repository/                    Spring Data JPA interfaces
├── dto/request/                   Incoming request bodies
├── dto/response/                  Outgoing response shapes + ApiResponse<T> wrapper
├── security/                      JwtUtil, JwtAuthFilter, UserDetailsServiceImpl,
│                                   CurrentUserResolver
├── service/                       AuthService, DesignService, CartService,
│                                   BookingService, PaymentService, CityService, ArtistService
├── controller/                    REST endpoints (one per resource)
└── exception/                     Custom exceptions + GlobalExceptionHandler
src/main/resources/
├── application.properties
└── data.sql                       Seed data matching the frontend mockups
```

## Setup

### 1. Prerequisites
- JDK 17+
- MySQL 8 running locally (or update the URL to point at any reachable instance)
- Maven 3.8+
- A free Razorpay test account → https://dashboard.razorpay.com/app/keys

### 2. Configure `application.properties`
Edit `src/main/resources/application.properties` and replace:

| Property | What to put |
|---|---|
| `spring.datasource.password` | your local MySQL root password |
| `jwt.secret` | any long random string (already has a placeholder — change for production) |
| `razorpay.key.id` / `razorpay.key.secret` | from your Razorpay dashboard test mode |
| `spring.mail.username` / `spring.mail.password` | a Gmail address + an **App Password** (not your normal password) — only needed if you wire up booking-confirmation emails |

The database `shringar_db` is created automatically on first run (`createDatabaseIfNotExist=true`), tables are created by Hibernate (`ddl-auto=update`), and `data.sql` seeds 6 designs, 5 cities, their areas, 6 artists, and 5 coupons automatically — matching the frontend mockups exactly (BRIDE10, FIRST15, FESTIVE20, FLAT200, WELCOME5).

### 3. Run it
```bash
mvn clean install
mvn spring-boot:run
```
Server starts on **http://localhost:8080/api**

### 4. Run the frontend
The companion `shringar-frontend` folder (7 HTML pages + `js/api.js`) is already wired to call this backend at `http://localhost:8080/api`. It cannot be opened with `file://` — browsers block `fetch()` calls from local files in a way that breaks login/cart/booking. Serve it instead:

```bash
cd shringar-frontend
python3 -m http.server 5500
# or, in VS Code: right-click index.html → "Open with Live Server"
```
Then visit **http://localhost:5500**. The backend's CORS config already allows `http://127.0.0.1:5500` and `http://localhost:5500` out of the box (see `cors.allowed-origins` in `application.properties`) — if you serve it from a different port, add that origin there too.

The frontend's `js/api.js` stores the JWT in `localStorage` after login/signup and automatically attaches it as `Authorization: Bearer <token>` on every cart/booking/payment request. Change `API_BASE` at the top of that file if your backend runs anywhere other than `localhost:8080`.

## Key API Endpoints

### Auth (public)
| Method | Path | Body |
|---|---|---|
| POST | `/auth/signup` | firstName, lastName, phone, email, password |
| POST | `/auth/login` | identifier (email or phone), password |

### Designs (public)
| Method | Path |
|---|---|
| GET | `/designs` |
| GET | `/designs/featured` |
| GET | `/designs/category/{category}` |
| GET | `/designs/{id}` |
| GET | `/designs/suggest?skinTone=Wheatish&limit=4` ← powers AI Try-On suggestions |

### Cart (requires JWT)
| Method | Path |
|---|---|
| GET | `/cart` |
| POST | `/cart/items` `{designId, quantity, coverageNote}` |
| DELETE | `/cart/items/{cartItemId}` |
| POST | `/cart/coupon` `{code}` |
| DELETE | `/cart/coupon` |

### Cities / Artists (public)
| Method | Path |
|---|---|
| GET | `/cities` — all cities incl. "coming soon" ones, with their areas |
| GET | `/cities/active` |
| GET | `/artists?city=mumbai` |
| GET | `/artists/search?city=mumbai&area=Andheri` |

### Bookings (requires JWT)
| Method | Path |
|---|---|
| POST | `/bookings` — creates from current cart; see `CreateBookingRequest` fields |
| GET | `/bookings` |
| GET | `/bookings/{id}` |
| GET | `/bookings/reference/{ref}` |
| PATCH | `/bookings/{id}/cancel` — auto-refunds advance if >48 hrs before appointment |

### Payments (requires JWT)
| Method | Path |
|---|---|
| POST | `/payments/advance-order/{bookingId}` → returns Razorpay order id to open Checkout |
| POST | `/payments/verify` → verifies signature, marks booking CONFIRMED, clears cart |
| POST | `/payments/{bookingId}/mark-balance-paid?method=CASH` |

### Media & Social Links
| Method | Path | Auth |
|---|---|---|
| GET | `/settings` — Instagram/YouTube/WhatsApp/contact links shown in the footer | Public |
| POST | `/admin/uploads` — multipart `file` upload, returns `{ url: "/uploads/<uuid>.jpg" }` | **ROLE_ADMIN** |
| GET | `/uploads/{filename}` — serves the uploaded image directly | Public |

Real images are not required — every `Design` and `Artist` still has an `emojiIcon`/`avatarEmoji` fallback. If `imageUrl` (or `galleryImageUrls` / `portfolioImageUrls`) is set, the frontend automatically prefers the real photo over the emoji. To attach an uploaded image to a design or artist, `PATCH` the entity's `imageUrl` field via an admin endpoint (not yet built — see "What's Intentionally Left Open" below) or set it directly in the database after uploading.

**YouTube embeds**: set `Design.youtubeVideoUrl` (a process/tutorial video shown on that design's detail page) or `SiteSettings.youtubeIntroVideoUrl` (the homepage's "How It Works" video) to any standard `youtube.com/watch?v=...` or `youtu.be/...` URL — the frontend's `Shringar.renderYoutubeEmbed()` helper converts it to a responsive embed automatically.

**Instagram**: `SiteSettings.instagramHandle` powers the footer icon site-wide; `Artist.instagramHandle` powers the "📸 @handle" link shown on each artist's card on the homepage.

Every successful response is wrapped as:
```json
{ "success": true, "message": "...", "data": { ... } }
```
and errors as:
```json
{ "success": false, "message": "...", "data": null }
```

## Booking Notifications (SMS + Email)
When a booking's advance payment is verified (`PaymentService.verifyAdvancePayment()`), four notifications fire automatically and **asynchronously** on a dedicated thread pool (`AsyncConfig`, bean `notificationExecutor`) — none of them block the payment response back to the browser:

| Recipient | Channel | What they get |
|---|---|---|
| Customer | SMS (Twilio) | Booking reference, date, area, advance amount paid |
| Customer | Email | Full branded confirmation — date/time, designs, payment breakdown, "View Booking" button |
| Admin team | Email | Same details + customer contact info + assigned artist, sent to every address in `admin.notification-emails` |
| Assigned artist | Email | Date/time, client name + phone, full address, special requests, designs booked |

Cancelling a booking (`PATCH /bookings/{id}/cancel`) sends a fifth notification — a cancellation email to the customer explaining whether their advance is being refunded.

**Configuration** (`application.properties`):
```properties
# Twilio — leave disabled until you have real credentials + (for India) DLT registration
twilio.enabled=false
twilio.account-sid=YOUR_TWILIO_ACCOUNT_SID
twilio.auth-token=YOUR_TWILIO_AUTH_TOKEN
twilio.from-number=+15551234567

# Who gets the admin copy of every booking (comma-separated, no spaces needed)
admin.notification-emails=admin@shringar.in,owner@shringar.in

# Used to build the "View Booking" link inside emails
app.frontend-base-url=http://localhost:5500
```

**Fault tolerance by design**: every send is wrapped in its own try/catch and logged rather than thrown — a failed SMS, a missing artist email, or an SMTP timeout never rolls back the booking or blocks the other three notifications. If `twilio.enabled=false` (the default), the SMS step logs what *would* have been sent instead of attempting a real API call, so the booking flow works end-to-end out of the box with zero external credentials configured.

**Artist email isn't public**: `Artist.email` exists on the entity (seeded in `data.sql`) but is deliberately excluded from `ArtistResponse` — it's only ever read server-side by `EmailService`, never returned over the public `/artists` API.

To actually receive emails locally, fill in real Gmail SMTP credentials (`spring.mail.username` / `spring.mail.password`, using a Gmail **App Password**, not your normal password) in `application.properties`.

## Business Rules Implemented
- **30% advance / 70% balance** — calculated automatically in `Cart` and `Booking` (ceiling-rounded).
- **Free cancellation window** — `Booking.canCancelFree()` checks if `now` is more than 48 hours before the appointment; if so, `PaymentService.processRefundIfEligible()` triggers an automatic Razorpay refund of the advance.
- **Coupons** — percent or flat, with a minimum-order threshold; removed automatically from the cart if items are removed and the subtotal drops below the coupon's minimum.
- **Artist daily cap** — a simple guard rejects a new booking if an artist already has 3+ confirmed/pending bookings on the requested date.
- **AI Try-On matching** — each `Design` carries a `recommendedSkinTones` list; `/designs/suggest?skinTone=X` ranks designs accordingly. The actual photo → skin-tone detection step (vision/AI call) is expected to happen on the frontend or a separate microservice, which then calls this endpoint with the resolved tone string.

## Making Yourself an Admin (needed to upload images)
Signup always creates a `CUSTOMER`. To upload images via `POST /admin/uploads`, promote your account manually after signing up once:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'you@email.com';
```
Then log in again so the new JWT carries `ROLE_ADMIN`.

## What's Intentionally Left Open
- **Admin CRUD for designs/artists** — `POST /admin/uploads` exists for raw image upload, but there's no `PATCH /admin/designs/{id}` yet to attach the returned URL to a design. Add an `AdminController` following the same pattern as the others here, or set `image_url` / `gallery_image_urls` directly via SQL for now.
- **Cloud image hosting** — `FileStorageService` saves to local disk (`./uploads`) for simplicity. Swap its `storeImage()` implementation for an S3/Cloudinary SDK call when deploying beyond localhost — the controller and DB schema (`image_url` as a plain string) don't need to change.
- **SMS to artist/admin** — only the customer gets an SMS today (Twilio); artists and admins currently get email only. Add a second `smsService.sendSms()` call in `BookingNotificationService.notifyBookingConfirmed()` if artists should also get a text.
- **OAuth/Google login** — `User.googleId` column exists; add a Google token-verification step in `AuthService` to complete it.

## Quick Test (curl)
```bash
# Sign up
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Priya","lastName":"Sharma","phone":"9876543210","email":"priya@test.com","password":"password123"}'

# Browse designs (no auth needed)
curl http://localhost:8080/api/designs

# Add to cart (replace TOKEN with the JWT from signup response)
curl -X POST http://localhost:8080/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"designId":1,"quantity":1}'
```
