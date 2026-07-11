# Task Manager — Frontend (React + Vite)

## Setup (run these yourself)

```bash
npm install
cp .env.example .env
```

## Run

```bash
npm run dev
```

Opens http://localhost:5173 (make sure the backend is running on :8000).

## Structure

```
index.html          Vite entry HTML
src/main.jsx        app entry — router + providers
src/index.css       global styles
src/api/client.js   fetch wrapper (adds the JWT Authorization header)
src/context/        AuthContext (token state, login/logout)
src/components/      shared components (ProtectedRoute, ...)
src/pages/          Login, Register, Tasks, Friends, NotFound
```

## Git (run yourself)

```bash
git init
git add .
git commit -m "Phase 0: frontend skeleton"
# create the GitHub repo, then:
git remote add origin <your-repo-url>
git push -u origin main
# add snirN as a collaborator on the repo
```
