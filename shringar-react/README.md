# Shringar Royal Mehendi - React Frontend

Modern Single Page Application (SPA) built with **React**, **Vite**, **Tailwind CSS**, and **Lucide Icons** for Shringar Royal Mehendi Platform.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The app runs at `http://localhost:3000/`. API requests to `/api` are automatically proxied to the Spring Boot backend at `http://localhost:8080/`.

### 3. Production Build
```bash
npm run build
```
Generates production-optimized static files in the `dist/` directory.

---

## 🧭 Page Architecture & Routes

| Route | Page Component | Description |
| :--- | :--- | :--- |
| `/` | `Home.jsx` | Curated 6-design showcase with luxury banner & quick actions |
| `/designs` | `DesignsPage.jsx` | Dedicated standalone catalog with category & coverage filters |
| `/designs/:id` | `DesignDetailPage.jsx` | Detailed motif view with cone estimator and booking |
| `/booking` | `BookingPage.jsx` | 4-Step ceremony appointment wizard |
| `/cart` | `CartPage.jsx` | Selected designs, promo coupon discounts, and checkout |
| `/ai-tryon` | `AiTryOnPage.jsx` | Gemini AI palm scan & try-on recommendation |
| `/login` | `LoginPage.jsx` | Customer / Admin authentication with Email OTP |
| `/orders` | `OrdersPage.jsx` | Booking history and real-time status tracker |
| `/profile` | `ProfilePage.jsx` | Customer profile & venue address book |
| `/help` | `HelpPage.jsx` | Henna aftercare guide, FAQs, and concierge tickets |
| `/admin/dashboard` | `AdminDashboard.jsx` | Administrative suite for appointments & concerns |

---

## 🎨 Luxury Brand Design System
- **Maroon Palette**: `#7a2c1a` (primary), `#5a1f12` (dark), `#963720` (light)
- **Gold Accent**: `#ffd700` (accent), `#ffae00` (warm), `#fff4cc` (light)
- **Cream Canvas**: `#fdfbf7`
- **Typography**: `Cinzel Decorative` (royal titles), `Cinzel` (headings), `Jost` (body)
