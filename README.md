# TaskFlow-Manager

Task tracker for teams: projects with nested subtasks, team roles, and AI assistance from Google Gemini.

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, React Router |
| Backend | Java 17, Spring Boot 3.3, Spring Security (JWT) |
| Accounts | MySQL via Spring Data JPA (`users` table: name, email, password hash) |
| Teams, projects, tasks | MongoDB via Spring Data MongoDB |
| AI | Google Gemini API (`generateContent`) |

## Run it

1. **Databases**: `docker compose up -d` (or point the env vars below at your own MySQL and MongoDB).
2. **Backend**:
   ```bash
   cd backend
   export GEMINI_API_KEY=your-key        # optional; AI buttons show a message without it
   export JWT_SECRET=a-long-random-string-of-32+-chars
   mvn spring-boot:run                   # http://localhost:8080
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev                           # http://localhost:5173 (proxies /api to :8080)
   ```

Environment variables: `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `GEMINI_MODEL` (default `gemini-2.5-flash`), `CORS_ORIGIN`.

## Pages and forms

- **Home**: greeting, status breakdown of your tasks, what's due next. 
- **My teams**: your teams and members with roles. Form: **Create team**, **Add member** (leaders only).
- **My projects**: projects with progress, a task tree with nested subtasks, AI summary. Leaders create projects.
- **My tasks**: your assigned tasks as To do / In progress / Done columns. Form: **Add task** (also used for subtasks).

## Roles (per team)

| Action | Team leader | Senior member | Junior member |
|---|---|---|---|
| Add members, create projects | Yes | No | No |
| Create tasks / subtasks | Assign to anyone | Assign to self or juniors | Assign to self |
| Change task status | Any task | Any task | Only tasks assigned to them |
| Delete a task (and its subtasks) | Any task | Own tasks | Own tasks |

Rules are enforced server-side in `TaskService`, `ProjectService` and `TeamService`; the UI only mirrors them.

## Dual-database design

`com.taskhub.repo.sql` holds JPA repositories (MySQL) and `com.taskhub.repo.mongo` holds Mongo repositories; `DataConfig` wires each package to its own store. Mongo documents reference users by the MySQL `users.id`. Member names and emails are copied into the team document so team pages don't need a cross-database lookup.

## API

```
POST /api/auth/register | /api/auth/login
GET  /api/teams/mine            POST /api/teams            POST /api/teams/{id}/members
GET  /api/projects/mine         POST /api/projects         GET  /api/projects/{id}/tasks
GET  /api/tasks/mine            POST /api/tasks            PATCH /api/tasks/{id}/status   DELETE /api/tasks/{id}
POST /api/ai/subtasks           GET  /api/ai/projects/{id}/summary
```
