# Wedding and Event Planning Management Platform

GLA University, B.Tech CSE 3rd Year mini project, Group 7.
Mentor: Yash Singh

A React.js web application for planning weddings and events: vendor directory,
budget tracking, guest list with RSVP, and task checklist. All data is stored in
JSON format (`db.json`) and served as a REST API by JSON Server.

## Team

| Member | Module | Branch | Folder |
|---|---|---|---|
| Kapil Singh (Team Lead) | UI design, layout, navigation, GitHub repository management (branch protection, Pull Request merges into `dev` and `main`) | `feature/frontend` | `src/components`, `src/pages`, `src/App.jsx` |
| Hemant Varshney | Vendor directory, search, filters, db.json data setup | `feature/vendors` | `src/features/vendors`, `db.json` |
| Jatin Kumar | Events, budget tracker, guest list, task checklist | `feature/planning` | `src/features/planning` |
| Kanishk Chahar | Register, login, logout, protected pages | `feature/auth` | `src/features/auth`, `src/services` |

Each member works only inside their own folder to avoid merge conflicts.
Talk to the team before changing shared files (`App.jsx`, `db.json`, `package.json`).

## Run the project

```bash
npm install
npm run server   # JSON database API on http://localhost:3001
npm run dev      # React app on http://localhost:5173
```

## Git workflow

`feature/*` -> Pull Request -> `dev` -> test -> Pull Request -> `main`

- Never push directly to `main`.
- Start every feature from the latest `dev`:
  `git switch dev`, `git pull origin dev`, `git switch -c feature/<name>`
- Open Pull Requests into `dev`, and get one teammate to review.
- Only the tested `dev` branch is merged into `main`.
- Never commit `.env` files, passwords, or API keys.
