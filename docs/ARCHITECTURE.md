# Nexus (Business Nexus) Frontend Architecture

This project is a **Vite + React 18 + TypeScript** SPA using **React Router** for routing and **TailwindCSS** for styling. The app is built around a protected dashboard layout with role-based navigation (Investor vs Entrepreneur) and mock data stored in code and `localStorage`.

## High-level structure

- **Entry**: `src/main.tsx` mounts `src/App.tsx`.
- **Routing**: `src/App.tsx` defines all routes with `react-router-dom@6`.
  - Public routes: `/login`, `/register`
  - Protected routes: wrapped by `DashboardLayout` (see below)
- **Layout**: `src/components/layout/DashboardLayout.tsx`
  - Gatekeeps access: redirects unauthenticated users to `/login`.
  - Provides a consistent frame: `Navbar` + `Sidebar` + scrollable content region.
- **Pages**: `src/pages/**` contain route-level screens (dashboard, messages, notifications, documents, deals, etc.).
- **Reusable UI**: `src/components/ui/**` contains small composable primitives (e.g. `Button`, `Card`, `Input`, `Badge`, `Avatar`) used across pages.
- **Feature components**: `src/components/<feature>/**` contain domain-specific cards/lists (e.g. chat, collaboration, investor/entrepreneur cards).

## State management & data flow

- **Auth state**: `src/context/AuthContext.tsx`
  - Stores the current user in React state.
  - Persists user to `localStorage` (`business_nexus_user`) for session restoration.
  - Implements mock `login/register/forgot/reset/updateProfile` flows.
  - Consumed via `useAuth()` throughout dashboard pages and navigation.
- **Mock data**: `src/data/**`
  - Static arrays for users, messages, collaboration requests.
  - Some pages compute derived data locally (filters, counts, etc.).
- **Per-page local state**:
  - Pages typically hold UI state in component state (`useState`) and occasionally hydrate derived data using `useEffect`.

## UI system / theme

- **Tailwind** is the styling system. Global styles are minimal (`src/index.css` only tailwind directives).
- **Design tokens** live in `tailwind.config.js`:
  - **Colors**: `primary`, `secondary`, `accent`, plus `success/warning/error` shades.
  - **Typography**: `fontFamily.sans = Inter var`.
  - **Animations**: `fade-in`, `slide-in` (used via utility classes like `animate-fade-in`).
- **Layout spacing**:
  - `DashboardLayout` uses a consistent page container: `p-6` with `max-w-7xl mx-auto`.
- **Responsiveness**:
  - Sidebar is hidden on small screens (`hidden md:block`).
  - Navbar includes a mobile menu for top-level links.

## Role-based UX

- `Sidebar` renders different route links based on `user.role`:
  - Entrepreneur: dashboard, startup profile, investors, messages, notifications, documents.
  - Investor: dashboard, portfolio profile, entrepreneurs, messages, notifications, deals.

## Conventions to follow for new modules

- Prefer **route-level** UI in `src/pages/<feature>/<Feature>Page.tsx`.
- Prefer small reusable building blocks in `src/components/ui/**` if they are broadly useful.
- Keep feature data persisted in **`localStorage`** when no backend exists, and expose it through a small hook or module (similar spirit to AuthContext but scoped to the feature).
- Use existing Tailwind tokens and layout patterns to match the current visual system.

