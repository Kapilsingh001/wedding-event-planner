# Wedding and Event Planning Management Platform

GLA University, B.Tech CSE 3rd Year mini project, Group 7.
Mentor: Yash Singh

A React.js web application for planning weddings and events: a vendor directory
with search and filters, event planning, expense tracking against a budget, and
user accounts. There is no backend server. Data is stored in `db.json` and served
as a REST API by JSON Server.

## Team

| Member | GitHub | Module | Branch | Folder |
|---|---|---|---|---|
| Kapil Singh (Team Lead) | [@Kapilsingh001](https://github.com/Kapilsingh001) | Homepage, navbar, footer, shared design system, routing, Git and GitHub management | `feature/frontend` | `src/components`, `src/pages` |
| Hemant Varshney | [@Hemant284](https://github.com/Hemant284) | Vendor directory with search, city and category filters, sorting | `feature/vendors` | `src/features/vendors` |
| Jatin Kumar | [@jatin110105](https://github.com/jatin110105) | Events, expenses and budget tracking | `feature/planning` | `src/features/planning` |
| Kanishk Chahar | [@Kanishkchahar](https://github.com/Kanishkchahar) | Register, login, logout, protected routes | `feature/auth` | `src/features/auth` |

Work only inside your own folder. Talk to the team before changing shared files
(`src/App.jsx`, `src/index.css`, `db.json`, `package.json`).

## Features

- **Homepage**: hero, core features, how it works, a dashboard preview (demo data), popular wedding services and a call to action
- **Vendors**: list of vendors from the database, search by name, filter by city and category, sort by rating or price
- **Events**: create events with a type, date, venue and budget; open an event to see its details
- **Budget**: add expenses to an event; total spent and remaining budget are calculated, and going over budget is highlighted
- **Accounts**: register, login and logout; the Events page is protected and redirects to login
- **Responsive**: works from desktop down to phone width, with a hamburger menu on small screens

## Tech stack

| Part | Choice |
|---|---|
| UI | React 19 with Vite |
| Routing | React Router DOM |
| Styling | Plain CSS with CSS variables (no CSS framework) |
| Data | `db.json` served by JSON Server on port 3001 |
| Auth state | `localStorage` |

## Getting started

```bash
git clone https://github.com/Kapilsingh001/wedding-event-planner.git
cd wedding-event-planner
git switch dev
npm install
```

The app needs two terminals, both inside the project folder.

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

## Project structure

```
src/
  App.jsx                 routes for every page
  index.css               shared colours, fonts, buttons
  components/
    Navbar.jsx, Footer.jsx, Icons.jsx
    home/                 sections of the homepage
  pages/
    Dashboard.jsx         homepage, composed from the home/ sections
    Guests.jsx            placeholder for a future guest list
  features/
    auth/                 Login, Register, ProtectedRoute, auth helpers
    vendors/              Vendors page
    planning/             Events, CreateEventForm, EventDetail, AddExpenseForm
db.json                   users, vendors, cities, categories, events, expenses
```

## Git workflow

```
feature/* -> Pull Request -> review -> dev
```

| Branch | Purpose | Rule |
|---|---|---|
| `main` | Protected. Initial setup only | Do not push or merge here |
| `dev` | Integration branch with the current project | All Pull Requests merge here |
| `feature/*` | Individual member work | One branch per member |

### Start your work

```bash
git switch dev
git pull origin dev
git switch -c feature/<your-branch>
```

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
6. Do not commit test accounts in `db.json`. Run `git restore db.json` after testing.
7. Do not commit `.env` files, passwords, or API keys.

## Timeline

| Date | Goal |
|---|---|
| 15 Sept | Project setup, branches and team folders |
| 19 Sept | Feature Pull Requests merged into `dev` |
| 20 Sept | Full integration and testing on `dev` |
| 23 Sept | Presentation and viva |
