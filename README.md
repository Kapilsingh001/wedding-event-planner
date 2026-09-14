# Wedding and Event Planning Management Platform

GLA University, B.Tech CSE 3rd Year mini project, Group 7.
Mentor: Yash Singh

A React.js web application for planning weddings and events: vendor directory,
budget tracking, guest list with RSVP, and task checklist. All data is stored in
JSON format (`db.json`) and served as a REST API by JSON Server.

## Team

| Member | Module | Branch | Folder |
|---|---|---|---|
| Kapil Singh (Team Lead) | Frontend development: UI design, layout, navigation, dashboard, all pages, integration | `feature/frontend`, `dev` | `src/components`, `src/pages`, `src/App.jsx` |
| Hemant Varshney | Vendor directory, search, filters, shortlist | `feature/vendors` | `src/features/vendors` |
| Jatin Kumar | Events, budget tracker, guest list, task checklist | `feature/planning` | `src/features/planning` |
| Kanishk Chahar | Login and registration, db.json data, JSON Server API | `feature/auth` | `src/features/auth`, `src/services`, `db.json` |

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
