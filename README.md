# Wedding and Event Planning Management Platform

GLA University, B.Tech CSE 3rd Year mini project, Group 7.
Mentor: Yash Singh

A React.js web application for planning weddings and events: vendor directory,
budget tracking, guest list, and task checklist. Data is stored in JSON format.

## Team

| Member | Module | Branch | Folder |
|---|---|---|---|
| Kapil Singh (Team Lead) | UI design, layout, navigation, Git and GitHub management | `feature/frontend` | `src/components`, `src/pages` |
| Hemant Varshney | Vendor directory, search, filters | `feature/vendors` | `src/features/vendors` |
| Jatin Kumar | Events, budget tracker, guest list, task checklist | `feature/planning` | `src/features/planning` |
| Kanishk Chahar | Register, login, logout, protected pages | `feature/auth` | `src/features/auth` |

Work only inside your own folder. Talk to the team before changing shared files
(`src/App.jsx`, `src/main.jsx`, `package.json`).

## Getting started

```bash
git clone https://github.com/Kapilsingh001/wedding-event-planner.git
cd wedding-event-planner
npm install
npm run dev
```

Open http://localhost:5173

## Git workflow

```
feature/* -> Pull Request -> dev -> test -> Pull Request -> main
```

| Branch | Purpose | Rule |
|---|---|---|
| `main` | Final stable submission version | Do not push directly |
| `dev` | Integration and testing | All feature Pull Requests merge here first |
| `feature/*` | Individual member work | One branch per member |

### Start your work

```bash
git switch dev
git pull origin dev
git switch -c feature/<your-branch>
```

### Every day

```bash
git switch dev
git pull origin dev
git switch feature/<your-branch>
git merge dev
# ...work...
git add .
git commit -m "Describe what you did"
git push -u origin feature/<your-branch>
```

### When your feature works

Open a Pull Request on GitHub from `feature/<your-branch>` into `dev`, and ask a
teammate to review it.

## Team rules

1. Never push directly to `main`.
2. Every member commits their own work from their own GitHub account.
3. Feature Pull Requests always target `dev`.
4. Pull the latest `dev` before starting new work.
5. Make small commits with clear messages.
6. Do not commit `.env` files, passwords, or API keys.
7. Resolve merge conflicts carefully and test before pushing.

## Timeline

| Date | Goal |
|---|---|
| 19 Sept | All feature Pull Requests merged into `dev` |
| 20 Sept | Full testing, then `dev` merged into `main` |
| 21-25 Sept | Demo (about 35% of the project) |
