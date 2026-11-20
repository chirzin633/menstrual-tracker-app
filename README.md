# Menstrual Tracker

A web app for tracking menstrual cycles, mood, physical activity, and profile data. It uses Next.js App Router, Prisma, MariaDB/MySQL, and cookie-based JWT authentication.

Status: MVP/prototype. Not production-ready.

## Features

- Signup, login, and logout.
- Page protection through middleware and API session validation.
- Dashboard with cycle summary:
  - Cycle day.
  - Cycle phase.
  - Total cycles.
  - Next period prediction.
- Cycle tracker:
  - Add, view, edit, and delete cycles.
  - Flow intensity from 1 to 5.
  - Symptoms as comma-separated text.
  - Notes.
  - Period length, cycle length, next cycle prediction, and average cycle length.
- Mood tracker:
  - Mood, energy level, stress level, and notes.
  - Add, view, and delete entries.
- Activity tracker:
  - Activity type, duration, intensity, and notes.
  - Add, view, and delete entries.
- Profile:
  - Name, email, and birth date.
  - Average cycle length and average period length.
  - Email and push notification preferences.
- Responsive UI with Tailwind CSS and Lucide icons.

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js `15.5.20` App Router |
| Language | JavaScript/JSX, no TypeScript |
| UI | React `19.1.0`, Tailwind CSS v4 |
| Icons | `lucide-react` |
| Notifications | `react-hot-toast` |
| Database | MySQL/MariaDB |
| ORM | Prisma `7.8.0` |
| Adapter | `@prisma/adapter-mariadb` |
| Password hashing | `bcrypt` |
| JWT | `jsonwebtoken` and `jose` |
| Build | Turbopack |

The project installs these dependencies but does not use them in `src`: `date-fns`, `js-cookie`, `react-datepicker`, `react-hook-form`, `@types/cookie`.

## Project Structure

```text
.
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ activities/
│  │  │  ├─ auth/
│  │  │  ├─ cycles/
│  │  │  ├─ moods/
│  │  │  └─ profile/
│  │  ├─ cycles/page.jsx
│  │  ├─ dashboard/page.jsx
│  │  ├─ login/page.jsx
│  │  ├─ mood-activity/page.jsx
│  │  ├─ profile/page.jsx
│  │  ├─ signup/page.jsx
│  │  ├─ layout.jsx
│  │  ├─ page.jsx
│  │  └─ globals.css
│  ├─ components/
│  │  ├─ Card.jsx
│  │  ├─ LoadingSpinner.jsx
│  │  └─ Navbar.jsx
│  ├─ generated/prisma/
│  ├─ lib/
│  │  ├─ auth.js
│  │  └─ prisma.js
│  └─ middleware.js
├─ .env.example
├─ jsconfig.json
├─ next.config.mjs
├─ package.json
├─ postcss.config.mjs
└─ prisma.config.ts
```

The `@/*` alias points to `./src/*`.

## Requirements

- Node.js version compatible with Next.js 15.
- npm.
- MySQL or MariaDB database.
- A database and database user.

## Environment Variables

Create `.env` in the project root. The app reads these variables:

```env
DATABASE_URL="mysql://user:password@localhost:3306/menstrual_tracker"
DATABASE_HOST="localhost"
DATABASE_USER="user"
DATABASE_PASSWORD="password"
DATABASE_NAME="menstrual_tracker"
JWT_SECRET="replace-with-a-strong-secret"
JWT_EXPIRES_IN="7d"
```

Notes:

- `src/lib/prisma.js` reads `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, and `DATABASE_NAME`.
- `prisma.config.ts` reads `DATABASE_URL`.
- `.env.example` does not include `DATABASE_PASSWORD`, `JWT_SECRET`, or `JWT_EXPIRES_IN` yet.
- Do not commit `.env`.
- Use a long, random `JWT_SECRET`.
- `prisma.config.ts` imports `dotenv/config`. Install `dotenv` if the Prisma CLI cannot load `.env`.

## Installation

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

The migration command creates the tables if the database is empty.

## Running the App

Development:

```bash
npm run dev
```

Open `http://localhost:3000`.

Production:

```bash
npm run build
npm run start
```

## Scripts

| Script | Command |
|---|---|
| `dev` | `next dev --turbopack` |
| `build` | `next build --turbopack` |
| `start` | `next start` |

The project has no `lint` or `test` script.

## Authentication

- The app hashes passwords with bcrypt at salt rounds `10`.
- Login creates a JWT with the payload `{ userId }`.
- The app stores the JWT in a `token` cookie with `httpOnly`, `sameSite: "lax"`, and `secure` in production.
- Login also creates a `Session` row in the database.
- `getUserIdFromRequest()` validates the JWT and the database session for API routes.
- Middleware checks the JWT for `/dashboard`, `/cycles`, `/mood-activity`, and `/profile`.
- Logout removes the cookie and the related session row.
- The landing page reads `localStorage.user` to choose the initial redirect.

## API

Every endpoint that returns user data reads `userId` from the session, not from the request body.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Create a user account. |
| `POST` | `/api/auth/login` | Log in and set the cookie. |
| `POST` | `/api/auth/logout` | Log out. |
| `GET` | `/api/auth/logout` | Log out and redirect to `/login`. |

### Cycles

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cycles` | List the user's cycles. |
| `POST` | `/api/cycles` | Create a cycle. |
| `PUT` | `/api/cycles/:id` | Update a cycle. |
| `DELETE` | `/api/cycles/:id` | Delete a cycle. |

### Moods

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/moods` | List the user's mood entries. |
| `POST` | `/api/moods` | Create a mood entry. |
| `PUT` | `/api/moods/:id` | Update a mood entry. |
| `DELETE` | `/api/moods/:id` | Delete a mood entry. |

### Activities

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/activities` | List the user's activity entries. |
| `POST` | `/api/activities` | Create an activity entry. |
| `PUT` | `/api/activities/:id` | Update an activity entry. |
| `DELETE` | `/api/activities/:id` | Delete an activity entry. |

### Profile

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/profile` | Get the profile and user data. |
| `PUT` | `/api/profile` | Update the profile and preferences. |

## Data Model

Main Prisma models:

- `User`: email, password hash, name, birth date, phone.
- `Profile`: average cycle length, average period length, notification preferences.
- `Cycle`: start and end dates, cycle length, period length, symptoms, notes, flow intensity, next prediction.
- `Mood`: date, mood, energy level, stress level, notes.
- `Activity`: date, activity type, duration, intensity, notes.
- `Session`: JWT, user, expiry time.
- `Badge` and `userBadge`: gamification models, not used in the UI yet.

Main relations:

- `User` 1-1 `Profile`.
- `User` 1-N `Cycle`, `Mood`, `Activity`, `Session`.
- `User` N-N `Badge` through `userBadge`.
- Every foreign key uses `onDelete: Cascade`.

## Implementation Notes

- Every page uses `"use client"` and fetches data through internal API routes.
- No Server Component reads Prisma directly.
- No Server Actions.
- No `loading.js`, `error.js`, or `not-found.js` files.
- The app stores `symptoms` as a JSON string.
- Cycle edits recalculate `periodLength`, `cycleLength`, `predictedNextDate`, and the average cycle length.
- Cycle deletes recalculate cycle statistics.
- The dashboard uses mock badges instead of the `Badge` table.
- Mood and activity endpoints support `PUT`, but the UI has no edit form.
- The `Change Password` and `Delete Account` buttons on the profile page do nothing.
- Email and push notification preferences do not send notifications.
- No pagination, filters, or search.
- No rate limiting for login or signup.
- No automated tests or lint configuration.

## Known Limitations

- Cycle creation rejects historical entries before the latest cycle.
- Page middleware verifies only the JWT. API routes also validate the database session.
- `averagePeriodLength` does not update automatically from cycle data.
- `flowIntensity`, `duration`, `energyLevel`, `stressLevel`, and `intensity` rely on UI validation and lack strict API checks.
- Updates cannot clear `birthDate`.
- The app does not trim or lowercase email values.
- No email verification, password reset, or refresh token.

## Security

- Do not commit `.env`.
- Use a strong, unique `JWT_SECRET`.
- Use HTTPS in production so the `secure` cookie flag takes effect.
- The API never returns passwords.
- API routes check data ownership through the session `userId`.
- Logout deletes the database session.
- Run a security review before a production deploy.
