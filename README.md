# Wedding and Event Planning Management Platform

The website is called **Kalyanam**, a word that means "wedding" and "auspicious".

GLA University, B.Tech CSE 3rd Year mini project, Group 7.
Mentor: Yash Singh

A React.js web application for planning a wedding from start to finish: find and
book vendors, plan every ceremony, track the budget and payments, manage the
guest list, send invitations, and follow a task checklist. There is no custom
backend server. Data is stored in `db.json` and served as a REST API by JSON Server.

## Team

| Member | GitHub | Module | Branch | Folder |
|---|---|---|---|---|
| Kapil Singh (Team Lead) | [@Kapilsingh001](https://github.com/Kapilsingh001) | Homepage, user dashboard, task checklist, wedding timeline, dark mode, shared UI kit, routing, Git and GitHub management | `feature/frontend` | `src/components`, `src/pages` |
| Hemant Varshney | [@Hemant284](https://github.com/Hemant284) | Vendor directory, vendor detail page, shortlist, booking requests | `feature/vendors` | `src/features/vendors` |
| Jatin Kumar | [@jatin110105](https://github.com/jatin110105) | Events and ceremonies, expenses, budget charts, payment tracking | `feature/planning` | `src/features/planning` |
| Kanishk Chahar | [@Kanishkchahar](https://github.com/Kanishkchahar) | Register, login, protected routes, guest list, digital invitations | `feature/auth` | `src/features/auth`, `src/features/guests` |

## Features

### Accounts (Kanishk)
- Register, login and logout, with form validation (Zod + React Hook Form)
- Login state kept in Redux Toolkit and `localStorage`
- Protected routes: private pages redirect to the login page

### Vendors (Hemant)
- 15 vendors across 19 cities and 5 categories
- Search by name, filter by city and category, sort by rating or price, pagination
- Vendor detail page
- Shortlist: save vendors and see them in "My Shortlist"
- Booking request: ask a vendor for a date, and follow the request in "My Bookings"

### Events and budget (Jatin)
- Create, edit and delete events; each user sees only their own events
- Ceremony types: Wedding, Engagement, Haldi, Mehendi, Sangeet, Reception and more
- Add expenses to an event; total spent and remaining budget are calculated
- Planned budget per category, with a pie chart and a bar chart (Recharts)
- Payment tracking: paid or pending, due dates, overdue payments highlighted

### Guests and invitations (Kanishk)
- Add, edit and delete guests, with RSVP status and counts
- Digital invitation with a preview, and one click to share it on WhatsApp

### Dashboard, tasks and timeline (Kapil)
- Homepage for visitors; a personal dashboard after login with the next event
  countdown, budget, guest and task summaries, and setup steps
- Task checklist with due dates, suggested wedding tasks and overdue labels
- Wedding timeline: every ceremony in date order, grouped by month, with days
  left and a budget bar
- Dark and light mode, remembered between visits
- Shared UI kit (`src/ui.css`), custom dropdown and date picker used on every page
- 404 page, page change animation, responsive from desktop to phone

## Tech stack

| Part | Choice |
|---|---|
| UI | React 19 with Vite |
| Routing | React Router DOM v7 |
| State | Redux Toolkit (login state) |
| Forms and validation | React Hook Form + Zod |
| API calls | Axios (one shared client in `src/services/api.js`) |
| Charts | Recharts |
| Styling | Plain CSS with CSS variables, light and dark themes |
| Data | `db.json` served by JSON Server on port 3001 |
| Testing | Vitest + Testing Library (77 tests) |

## Getting started

```bash
git clone https://github.com/Kapilsingh001/wedding-event-planner.git
cd wedding-event-planner
git switch dev
npm install
```

**Quick start:** on Windows, double-click `start.bat`. On Linux or Mac, run
`sh start.sh`. This starts the API and the website together and opens the browser
(Windows).

To start them by hand, the app needs two terminals, both inside the project folder.

Terminal 1, the website:

```bash
npm run dev
```

Terminal 2, the database API:

```bash
npx json-server db.json --port 3001
```

Open http://localhost:5173. A demo account is included: email `123@gmail.com`, password `123`.

The current code is on the `dev` branch. `main` holds only the initial project setup.

### Other commands

| Command | What it does |
|---|---|
| `npm test` | Runs all 77 tests (on Windows, use PowerShell) |
| `npm run build` | Builds the website into the `dist` folder |
| `npm run lint` | Checks the code with oxlint |

### API address

The website reads the API address from the `VITE_API_URL` variable, and uses
`http://localhost:3001` when it is not set. Copy `.env.example` to `.env` to change it.

## Project structure

```
src/
  App.jsx                 routes for every page
  index.css               colours, fonts, buttons, dark mode variables
  ui.css                  shared UI kit: cards, forms, pop-ups, tables, alerts
  theme.js                dark and light mode helpers
  services/api.js         one Axios client for every API call
  components/
    Navbar, Footer, Icons, Dropdown, DatePicker
    home/                 sections of the homepage
  pages/
    Dashboard.jsx         homepage, or the user dashboard after login
    UserDashboard.jsx     summary of events, budget, guests and tasks
    Tasks.jsx             task checklist
    Timeline.jsx          wedding timeline
    NotFound.jsx          404 page
  features/
    auth/                 Login, Register, ProtectedRoute, Redux slice and store
    vendors/              Vendors, VendorDetail, shortlist, BookingForm, MyBookings
    planning/             Events, EventDetail, forms, budget charts
    guests/               Guests, InviteModal
db.json                   users, cities, categories, vendors, events, expenses,
                          guests, tasks, bookings
```

Each page keeps its calculations in a small helper file (for example
`budgetUtils.js`, `vendorUtils.js`, `timelineUtils.js`), and each helper file has
a test file next to it (`*.test.js`).

## Git workflow

```
feature/* -> Pull Request -> review -> dev
```

| Branch | Purpose | Rule |
|---|---|---|
| `main` | Initial setup only | Do not push or merge here |
| `dev` | Integration branch with the current project | All Pull Requests merge here |
| `feature/*` | Individual member work | One branch per member |

### Every day

```bash
git switch feature/<your-branch>
git pull origin dev
# ...work...
git add <your files>
git commit -m "Describe what you did"
git push -u origin feature/<your-branch>
```

### When your feature works

Open a Pull Request on GitHub from `feature/<your-branch>` into `dev`. Check that
the base branch is `dev`. The team lead reviews and merges it.

## Team rules

1. Never push to or merge into `main`.
2. Every member commits their own work from their own GitHub account.
3. Pull Requests always target `dev`.
4. Pull the latest `dev` before starting new work.
5. Make small commits with clear messages.
6. Do not commit test data in `db.json`. Run `git restore db.json` after testing.
7. Do not commit `.env` files, passwords, or API keys.

## Timeline

| Date | Goal |
|---|---|
| 15 Sept | Project setup, branches and team folders |
| 23 Sept | Phase 1 presentation: homepage, vendors, events, login |
| 27 Oct | Phase 2: vendor detail, shortlist, edit and delete, charts, guests, dark mode |
| 15-22 Nov | Final phase: validation, Redux, tests, dashboard, tasks, bookings, payments, invitations, timeline |
| 23 Nov | Final presentation and submission |
