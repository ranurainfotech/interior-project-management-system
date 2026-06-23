# IPMS - Interior Project Management System

Mobile-first project finance and operations management for interior designers and contractors.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript** + **Tailwind CSS** + **ShadCN UI**
- **Firebase** (Auth, Firestore, Storage)
- **PWA** via `@ducanh2912/next-pwa`

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Firebase setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password** authentication
3. Create a **Firestore** database
4. Enable **Google Analytics** for the project and copy the **Measurement ID** (`G-...`)
5. Copy `.env.example` to `.env.local` and fill in your Firebase config (including `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`)

### 3. Deploy Firestore rules and indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Or create the composite indexes manually from `firestore.indexes.json` when Firestore prompts you.

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## MVP Features

- Create and manage projects
- Add project contacts
- Add labour and material vendors (parties)
- Assign parties to projects with agreed amounts
- Record transactions (client payments, labour/material payments, expenses)
- View calculated dues and profitability (never stored — always computed)
- Install as PWA on mobile devices

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # UI, forms, cards, layout
├── constants/        # Labour/material categories, transaction types
├── lib/
│   ├── auth/         # Firebase auth context
│   ├── calculations/ # Business logic (dues, profit, etc.)
│   ├── firestore/    # Firestore CRUD services
│   └── firebase.ts   # Firebase initialization
└── types/            # TypeScript interfaces
```

## Business Calculations

| Metric | Formula |
|--------|---------|
| Client Due | Contract Amount − Client Payments |
| Labour Due | Σ(Agreed Amount − Labour Payments) per assignment |
| Vendor Due | Σ(Agreed Amount − Material Payments) per assignment |
| Expenses | Labour + Material Payments + Misc Expenses |
| Profit | Client Received − Expenses |

## Firebase Analytics

The app tracks:

- **Screen views** on route changes
- **Login / logout**
- **Project, party, contact, transaction, and assignment** creation events

Analytics only runs in the browser when `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` is set. View events in the Firebase console under **Analytics**. Analytics works on the free Spark plan — no Blaze upgrade needed.

## Deploy to Vercel

The web app is deployed on **Vercel** (free tier works for Next.js).

1. Push the repo to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Add all `NEXT_PUBLIC_*` environment variables from `.env.example` in **Project Settings → Environment Variables**
4. Deploy — Vercel runs `next build` automatically on each push to `main`

Firestore rules and indexes are deployed separately (still on Firebase, no Blaze required):

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## License

Private — Satyam Tiwari
