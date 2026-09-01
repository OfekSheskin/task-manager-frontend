# Task Manager — Frontend

React client for the task-management system: tasks and subtasks, dependencies,
labels, friends and shared tasks. Talks to the FastAPI backend, which lives in a
separate repository.

Built with React, Vite, React Router and the Context API.

## Requirements

- Node 18+
- The backend running locally

## Setup

```bash
npm install
```

Add a `.env` file in the repository root pointing at the API:

```
VITE_API_BASE_URL=http://localhost:8000
```

Then:

```bash
npm run dev      # development server on http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
```

The backend allows `http://localhost:5173` through CORS, so run the client on
that port during development.

## Project layout

| Path | Holds |
|---|---|
| `index.html` | Vite's entry point (repository root, not `src/`) |
| `src/main.jsx` | mounts React, defines the routes and the protected layout |
| `src/pages/` | one component per route |
| `src/components/` | UI shared across pages |
| `src/context/` | app-wide state — `AuthContext` holds the JWT and user |
| `src/api/` | backend calls; `client.js` wraps `fetch` and attaches the token |

## Routes

| Path | Page |
|---|---|
| `/login` | log in, links to register |
| `/register` | create an account, links to log in |
| `/tasks` | task list, filters, create a task |
| `/tasks/:id` | one task: status, labels, dependencies, subtasks, sharing |
| `/tasks/:id/edit` | edit title, details, status, cancel reason |
| `/friends` | friends, pending requests, send a request |
| `/labels` | create, rename, recolour and delete labels |
| `*` | not found |

Everything except login and register sits behind `ProtectedRoute`, which waits
for the token to be verified before rendering and redirects to `/login` if it
is missing or expired.

## Notes on a couple of decisions

**The token lives in `AuthContext`, and the user is fetched from it.** On load
the context calls `/auth/me` with the stored token, which doubles as a validity
check — an expired token throws, gets cleared, and the user lands on the login
page. `userLoading` is derived from the two values rather than stored, so a page
can never render with a token but no user yet.

**Filtering happens on the client.** `GET /tasks` already returns every task the
user can see, and the page needs the full set anyway to work out which tasks are
roots. More to the point, `is_blocked` is derived by the backend from the
dependency graph and the subtask tree — it is not a column, so it could not be a
`WHERE` clause without duplicating that rule in SQL. Filtering the whole set in
one place keeps a single copy of the logic.

With no filter active the list shows root tasks only, since subtasks are shown
inside their parent's page. As soon as a filter is set it searches every visible
task, subtasks included, and captions each match with the parent it came from —
otherwise a labelled or blocked subtask could never be filtered for.
