# Task Manager

Multi-user task management web application built for the bolttech Full Stack Developer code challenge.

## Stack

- **Frontend:** React, TypeScript, MUI, Vite
- **Backend:** Express, TypeScript, MongoDB, Mongoose
- **Auth:** bcrypt + JWT (httpOnly cookie)
- **AI:** OpenAI API with local fallback (optional)
- **Tests:** Jest (backend), Vitest (frontend)
- **Local infra:** Docker Compose

## Quick start with Docker

```bash
docker compose up --build
```

On Fedora/RHEL with SELinux, bind mounts use the `:z` flag automatically in `docker-compose.yml`.

If you still hit permission errors, rebuild from scratch:

```bash
docker compose down -v
docker compose up --build
```

If the API is not available on port 3001, check backend logs:

```bash
docker compose logs backend --tail 100
```

You should see:

```
Installing backend dependencies...
Connected to MongoDB
Server running on http://0.0.0.0:3001
```

Reset everything and rebuild:

```bash
docker compose down -v
docker compose build --no-cache backend
docker compose up
```

Quick health check:

```bash
curl http://localhost:3001/api/health
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- MongoDB: localhost:27017

### OpenAI (optional)

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your-key-here
OPENAI_MODEL=gpt-4o-mini
```

Without a key, AI features use local fallback suggestions.

## Local development (without Docker)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Requires MongoDB running at `mongodb://localhost:27017/taskmanager`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Tests

```bash
cd backend && npm test
cd frontend && npm test
```

## Architecture

```
frontend (React SPA)
    │  HTTP + credentials (cookie)
    ▼
backend (Express REST API)
    ├── authService      → bcrypt + JWT
    ├── projectService → projects + tasks + business rules
    ├── aiService        → OpenAI + fallback
    └── MongoDB
```

### Key business rules

- Users only access their own projects and tasks
- Completed tasks cannot be edited or deleted
- Deleting a project removes its tasks
- AI suggestions are non-binding and clearly labeled

## API overview

| Area | Base path |
|------|-----------|
| Auth | `/api/auth` |
| Projects | `/api/projects` |
| Tasks | `/api/tasks` |
| AI | `/api/ai` |

## Trade-offs

| Decision | Rationale |
|----------|-----------|
| JWT in httpOnly cookie | Safer than localStorage for XSS |
| userId denormalized on tasks | Faster per-user queries |
| 404 for other users' resources | Avoid leaking resource existence |
| AI fallback | App works without OpenAI key |
| Monorepo | Single clone, shared Docker setup |

## Future improvements

- Refresh token rotation
- E2E tests with Playwright
- CI pipeline
- Rate limiting on auth and AI routes
- Optimistic UI updates

## AI usage disclosure

During development, **Cursor** was used as an AI-assisted coding tool to help implement the application.

- **What Cursor was used for:** generating and refining code, tests, Docker configuration, and documentation based on requirements discussed in chat.
- **What was not delegated:** the product ideas, architecture choices, stack selection, trade-offs, and overall structure of the solution. Those decisions were made intentionally before and during implementation.
- **Responsibility:** all submitted code was reviewed, tested, and validated locally. The final solution reflects my understanding of the codebase and design decisions.

The optional in-app AI features (task description assistant and task insights) use the OpenAI API when configured, with a local fallback when no API key is provided. That runtime AI integration is separate from the use of Cursor during development.

## Documentation

- `docs/desafio.md` — original challenge
- `docs/plano-implementacao.md` — implementation plan
- `docs/guia-do-projeto.md` — full project guide (Portuguese)
