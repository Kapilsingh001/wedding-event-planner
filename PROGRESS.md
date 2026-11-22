# Wedding & Event Planning Platform - Project Progress

**Project status:** Complete, all modules merged into `dev`
**Last updated:** 22 November 2026
**Final presentation and submission:** 23 November 2026

---

## Summary

| Item | Value |
|---|---|
| Pull Requests merged into `dev` | 32 |
| Automated tests | 77 (all passing) |
| Pages | Home, Dashboard, Vendors, Vendor Detail, Events, Event Detail, Timeline, Guests, Tasks, Login, Register, 404 |
| Database collections | users, cities, categories, vendors, events, expenses, guests, tasks, bookings |

---

## Phase 1 (15 - 23 September)

| Work | Member |
|---|---|
| Project setup, routing, navbar, footer, homepage, design system, GitHub branches | Kapil |
| Vendor list with search, city and category filters, sorting | Hemant |
| Create events, add expenses, budget calculation | Jatin |
| Register, login, logout, protected routes | Kanishk |

## Phase 2 (October)

| Work | Member |
|---|---|
| Dark and light mode, 404 page, shared Axios client | Kapil |
| Vendor detail page, shortlist, pagination | Hemant |
| Edit and delete events and expenses, events per user, budget pie chart | Jatin |
| Guest list with RSVP status | Kanishk |

## Final phase (15 - 22 November)

| Work | Member |
|---|---|
| User dashboard, task checklist, wedding timeline, shared UI kit, custom dropdown and date picker, test setup | Kapil |
| Booking requests, My Bookings, vendor helper functions with tests | Hemant |
| Planned budget with bar chart, Zod validation, payment tracking, ceremony types | Jatin |
| Redux Toolkit for login state, Zod validation, digital invitation with WhatsApp sharing | Kanishk |

---

## Team roles and modules

| Member | Module | Branch | Folder | Status |
|---|---|---|---|---|
| **Kapil Singh (Lead)** | Homepage, dashboard, tasks, timeline, theme, UI kit, GitHub management | `feature/frontend` | `src/components`, `src/pages` | Done |
| **Hemant Varshney** | Vendors, shortlist, bookings | `feature/vendors` | `src/features/vendors` | Done |
| **Jatin Kumar** | Events, expenses, budget, payments | `feature/planning` | `src/features/planning` | Done |
| **Kanishk Chahar** | Accounts, guests, invitations | `feature/auth` | `src/features/auth`, `src/features/guests` | Done |

---

## Demo flow

1. Homepage, then register and login
2. Dashboard: countdown, budget, guests, tasks, setup steps
3. Vendors: search, filter, open a vendor, shortlist, send a booking request
4. Events: create Haldi, Mehendi, Sangeet and Wedding; add expenses; charts; mark payments
5. Timeline: all ceremonies in date order
6. Guests: add guests, send an invitation on WhatsApp
7. Tasks: suggested tasks, due dates, mark as done
8. Dark mode and phone layout
9. GitHub: branches, Pull Requests, each member's commits, tests

---

## Git workflow

```
feature/* branch  ->  Pull Request  ->  review  ->  dev branch
```

1. Never push directly to `main`
2. Every member commits from their own GitHub account
3. Pull Requests always target `dev`
4. Do not commit test data in `db.json`, `.env` files, or passwords

---

## Links

- **GitHub repo:** https://github.com/Kapilsingh001/wedding-event-planner
- **Website (local):** http://localhost:5173
- **API (local):** http://localhost:3001
