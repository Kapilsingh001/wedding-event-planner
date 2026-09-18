# Wedding & Event Planning Platform - Project Progress

**Project Status:** Base setup complete and merged into `dev` ✅  
**Date:** 15 September 2026  
**Deadline:** Demo and submission 21-26 September 2026  
**Target for demo:** 35% of the project (1 complete flow)

---

## ✅ Completed (15 Sept)

### Phase 1: GitHub & Project Setup
- ✅ GitHub repository created at `https://github.com/Kapilsingh001/wedding-event-planner`
- ✅ Three branches created: `main`, `dev`, `feature/frontend`
- ✅ `main` branch protected (requires Pull Request to merge)
- ✅ Collaborators added: Hemant Varshney, Jatin Kumar, Kanishk Chahar
- ✅ README with team roles and workflow documented
- ✅ Pull Request template created for code reviews

### Phase 2: React Project Setup
- ✅ React 19 + Vite initialized
- ✅ React Router DOM installed and configured
- ✅ 5 pages created: Dashboard, Login, Register, Vendors, Events
- ✅ Navbar component with 5 working navigation links
- ✅ All routes connected to pages
- ✅ Routing tested and verified (no page reload on navigation)

### Phase 3: Database Setup
- ✅ `db.json` created with 4 empty collections:
  - `users` (for registration/login)
  - `vendors` (for vendor directory)
  - `events` (for event creation)
  - `expenses` (for budget tracking)
- ✅ JSON Server installed and configured
- ✅ npm script added: `npm run server` to start JSON Server on port 3001

### Phase 4: Project Structure
```
src/
├── components/          (Kapil's shared components)
│   └── Navbar.jsx
├── pages/              (Kapil's pages)
│   └── Dashboard.jsx
├── features/
│   ├── auth/           (Kanishk's authentication module)
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── vendors/        (Hemant's vendor module)
│   │   └── Vendors.jsx
│   └── planning/       (Jatin's planning module)
│       └── Events.jsx
├── App.jsx             (routing)
└── main.jsx            (entry point)
```

### Phase 5: First Pull Request
- ✅ Branch `feature/frontend` created
- ✅ All files committed: `f94dde8 Add routing, pages, navbar and JSON database setup`
- ✅ Pull Request #1 created from `feature/frontend` into `dev`
- ✅ Pull Request merged: `f49d412 Merge pull request #1`
- ✅ Base code now live on `dev` branch

---

## 📋 Team Roles & Modules

| Member | Module | Branch | Folder | Status |
|---|---|---|---|---|
| **Kapil Singh (Lead)** | UI design, layout, navigation, GitHub management | `feature/frontend` | `src/components`, `src/pages` | ✅ Base done |
| **Hemant Varshney** | Vendor directory, search, filters | `feature/vendors` | `src/features/vendors` | ⏳ Starting 16 Sept |
| **Jatin Kumar** | Events, budget tracker, guest list, task checklist | `feature/planning` | `src/features/planning` | ⏳ Starting 16 Sept |
| **Kanishk Chahar** | Register, login, logout, protected pages | `feature/auth` | `src/features/auth` | ⏳ Starting 16 Sept |

---

## 🚀 How to Get Started (for the team)

### One-time setup:
```bash
git config --global user.name "YourGitHubUsername"
git config --global user.email "your-github-email@gmail.com"
git clone https://github.com/Kapilsingh001/wedding-event-planner.git
cd wedding-event-planner
git switch dev
git switch -c feature/<your-branch>
npm install
npm run dev
```

### Every day after working:
```bash
git switch dev
git pull origin dev
git switch feature/<your-branch>
git merge dev
# ... do your work ...
git add .
git commit -m "What you did"
git push
```

### When your feature is ready:
1. Open a Pull Request on GitHub from your branch into `dev`
2. Ask Kapil to review and merge it

---

## 📅 Timeline

| Date | Milestone | Owner | Status |
|---|---|---|---|
| **15 Sept** | Base app (routing, pages, navbar, db.json) | Kapil | ✅ Merged into dev |
| **16-18 Sept** | Team builds their modules | All | ⏳ Starting tomorrow |
| **19 Sept** | All Pull Requests merged into `dev` | Kapil | ⏳ |
| **20 Sept** | Full testing, `dev` → `main` merge | All | ⏳ |
| **21-26 Sept** | Demo and submission | All | ⏳ |

---

## ✅ Demo Target (35% of project)

The demo will show **one complete user flow:**

1. **Register & Login** (Kanishk's module)
   - User can register with name, email, password
   - User data saved to `db.json`
   - User can log in and stay logged in

2. **Dashboard** (Kapil's UI)
   - Shows after login
   - Navigation bar visible
   - Links to other modules

3. **Vendor Search** (Hemant's module)
   - Show 15-20 vendors from `db.json`
   - Search by vendor name
   - Filter by category and city

4. **Create Event** (Jatin's module)
   - User can create an event (title, type, date, venue, budget)
   - Event saved to `db.json`
   - User can view their events list

5. **Add Expenses** (Jatin's module)
   - User can add expense to an event
   - See total spent vs budget
   - Expenses saved to `db.json`

6. **GitHub Proof** (Kapil's role)
   - Show the GitHub branches
   - Show merged Pull Requests
   - Explain the workflow

---

## 📁 What's Ready to Use

### For all team members:
- ✅ Clean React setup with Vite
- ✅ All 5 page files (empty, just headings)
- ✅ Navbar with working links
- ✅ React Router configured
- ✅ db.json with empty collections
- ✅ JSON Server ready to run

### What NOT to touch:
- ❌ `src/App.jsx` (routing setup)
- ❌ `src/components/Navbar.jsx` (shared navbar)
- ❌ `package.json` (only if you need to add a new package, ask Kapil first)
- ❌ Other team members' folders

### What you CAN create:
- ✅ New files in your own folder (`src/features/yourmodule/`)
- ✅ New pages
- ✅ New components
- ✅ Add data to `db.json` (in your collections)

---

## 🔗 Important Links

- **GitHub Repo:** https://github.com/Kapilsingh001/wedding-event-planner
- **Localhost (dev server):** http://localhost:5173
- **JSON Server (API):** http://localhost:3001

---

## 📝 Git Workflow Reminder

```
feature/* branch  →  Pull Request  →  dev branch  →  test  →  main branch
   (you work)         (review)       (team tests)         (submit)
```

**Rules:**
1. Never push directly to `main`
2. Every member commits from their own GitHub account
3. Small commits with clear messages
4. Pull the latest `dev` before starting new work
5. Don't commit `.env`, passwords, or API keys

---

## 🎯 Next Steps (16-18 Sept)

1. **Hemant:** Add vendor data to `db.json`, build vendor list page
2. **Jatin:** Build event form and event list page
3. **Kanishk:** Build register and login pages
4. **Kapil:** Style with Tailwind, build dashboard page

All team members: commit something every day, push before going to sleep.

---

## ✅ Ready to go!

The base is live on `dev`. Team can start pulling and coding tomorrow.

**Questions?** Ask in the WhatsApp group or check the README on GitHub.

**Demo date:** 21-26 September 2026 🎬
