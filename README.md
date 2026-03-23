# Growth Tutoring — Frontend

The React/Vite frontend for [growthtutoringhq.com](https://growthtutoringhq.com) — a two-sided tutoring marketplace connecting students and families with verified tutors, with a focus on students with specialized learning needs.

---

## Tech Stack

| Category              | Technology                                   |
| --------------------- | -------------------------------------------- |
| Framework             | React 19 + Vite 7                            |
| Routing               | React Router v7                              |
| Payments              | Stripe (`@stripe/react-stripe-js`)           |
| Image Hosting         | ImgBB API                                    |
| Location Autocomplete | Google Places API (`AutocompleteSuggestion`) |
| Spam Protection       | Google reCAPTCHA v2                          |
| Icons                 | `react-icons`                                |
| Deployment            | AWS CloudFront + S3 / Elastic Beanstalk      |

---

## Project Structure

```
src/
├── assets/               # Static assets (logo, images)
├── components/           # Shared reusable components
│   └── styles/           # Component-scoped CSS files
├── pages/
│   ├── admin/            # Admin dashboard pages
│   ├── chat/             # Messaging / inbox
│   ├── login/            # Auth pages (signup, login, forgot password)
│   ├── main/             # Public-facing pages (home, tutors, FAQ, etc.)
│   └── styles/           # Page-scoped CSS files
├── App.jsx               # Root component — routing + nav + auth state
├── main.jsx              # Entry point
└── index.css             # Global styles
```

---

## Pages & Routes

### Public

| Route                    | Page                                    |
| ------------------------ | --------------------------------------- |
| `/`                      | Home                                    |
| `/about`                 | About                                   |
| `/subjects`              | Subjects                                |
| `/tutors`                | Tutor search & browse                   |
| `/tutors/:id`            | Tutor profile                           |
| `/how-it-works/students` | How It Works — Students                 |
| `/how-it-works/tutors`   | How It Works — Tutors                   |
| `/how-it-works/cip`      | How It Works — Community Impact Program |
| `/faq`                   | FAQ                                     |
| `/terms/clients`         | Client Terms of Service                 |
| `/terms/tutors`          | Tutor Terms of Service                  |
| `/privacy-policy`        | Privacy Policy                          |
| `/contact`               | Contact / Feedback                      |

### Auth

| Route              | Page                              |
| ------------------ | --------------------------------- |
| `/signup`          | Role selection (Student vs Tutor) |
| `/signup/student`  | Student signup form               |
| `/signup/tutor`    | Tutor signup form                 |
| `/login`           | Login                             |
| `/forgot-password` | Forgot password                   |

### Student (authenticated)

| Route                    | Page                 |
| ------------------------ | -------------------- |
| `/my-profile`            | Profile management   |
| `/my-tutors`             | Saved tutors         |
| `/my-sessions`           | Session overview     |
| `/my-sessions/:category` | Sessions by category |
| `/my-payments`           | Payment history      |
| `/checkout`              | Checkout             |
| `/booking-success`       | Booking confirmation |

### Tutor (authenticated)

| Route                          | Page                  |
| ------------------------------ | --------------------- |
| `/my-profile`                  | Profile management    |
| `/my-students`                 | Student relationships |
| `/my-schedule`                 | Weekly schedule       |
| `/tutor/sessions`              | Session overview      |
| `/schedule/sessions/:category` | Sessions by category  |
| `/my-earnings`                 | Earnings dashboard    |

### Shared (authenticated)

| Route                       | Page                |
| --------------------------- | ------------------- |
| `/messages`                 | Inbox               |
| `/messages/:conversationId` | Conversation thread |

### Admin (role-gated)

| Route                     | Page                                                |
| ------------------------- | --------------------------------------------------- |
| `/admin`                  | Admin dashboard (users, tutors, sessions, feedback) |
| `/admin/flagged-messages` | Flagged message review                              |
| `/admin/promotions`       | Marketing email editor                              |

---

## Key Components

| Component                              | Description                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| `VerificationBadge`                    | Stacked blue checkmark badges (1–3) indicating tutor verification tier                |
| `ClickableAvatar`                      | Profile picture upload with ImgBB integration and image compression                   |
| `CityAutocomplete`                     | Google Places city search using `AutocompleteSuggestion` + `AutocompleteSessionToken` |
| `SessionRequestForm`                   | Booking form with subject, date, time, duration, and session type                     |
| `ScheduleDisplay`                      | Tutor weekly availability display                                                     |
| `ClientTermsModal` / `TutorTermsModal` | Inline terms-of-service modal at signup                                               |

---

## Getting Started

### Prerequisites

- Node.js `>= 20.19.0`
- A running instance of the [Growth Tutoring Backend](../backend) on port `8080`

### Install & Run

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint
```

---

## Auth & Session Management

- Auth state is stored in `localStorage` under the key `currentUser`.
- Sessions auto-expire after **30 minutes of inactivity** (idle timer in `App.jsx`).
- Email verification is required at signup before account creation completes.
- Password requirements: 8+ characters, uppercase, lowercase, number, special character.

---

## Payment Flow

1. Student fills out the booking form and is redirected to `/checkout`.
2. Stripe payment is **authorized** (not captured) at checkout time.
3. When the tutor **accepts** the session, the charge is **captured**.
4. Stripe charges the student `base amount + $5 platform fee`.
5. Tutor payouts are handled manually on the backend side.

---

## Tutor Verification Tiers

Managed by the admin dashboard and displayed via `VerificationBadge`:

| Tier     | Badge | Meaning            |
| -------- | ----- | ------------------ |
| `TIER_1` | ✔     | ID Verified        |
| `TIER_2` | ✔✔    | Background Checked |
| `TIER_3` | ✔✔✔   | Premium Verified   |

---

## Notes for Developers

- **CSS conventions:** All styles are in standalone `.css` files — no inline styles or CSS-in-JS. New feature styles use prefixed class names to avoid conflicts.
- **Mobile responsiveness:** Handled purely via CSS media queries. JSX is not modified for layout changes.
- **Google Places:** The `Autocomplete` widget was deprecated in March 2025. This project uses `AutocompleteSuggestion` + `AutocompleteSessionToken` with a custom dropdown. Do not revert to the legacy `Autocomplete` class.
- **Sticky headers:** Avoid `overflow-x: hidden` on `html`/`body` — it breaks `position: sticky`. Use `overflow-x: clip` on a wrapper element instead.
- **Full-width sections:** Use the `width: 100vw; left: 50%; margin-left: -50vw` pattern with an inner `max-width` container.

---

## Related Repository

[Growth Tutoring Backend](https://github.com/your-org/growth-tutoring-backend) — Java Spring Boot + MySQL
