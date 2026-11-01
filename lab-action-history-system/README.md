# Lab Action History Management System

Premium full-stack college computer laboratory management platform.

**Next.js 16 (App Router)** · **React 19** · **TypeScript** · **Tailwind CSS 4** · **Drizzle ORM** · **MySQL 8** · **Framer Motion**

---

## Quick Start with MySQL (database: `nizzu`)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure `.env`
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

It is already set up for your MySQL database:
```env
DB_DIALECT=mysql

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=nizzusql@11
DB_NAME=nizzu

JWT_SECRET=change-this-to-a-long-random-string
NODE_ENV=development
```

> ⚠️ If you use a single `DATABASE_URL` instead, URL-encode the `@` in your
> password as `%40`:
> `DATABASE_URL=mysql://root:nizzusql%4011@127.0.0.1:3306/nizzu`

### 3. Create the `nizzu` database
```bash
mysql -u root -p
```
```sql
CREATE DATABASE nizzu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```

### 4. Create the tables
Either let Drizzle generate them:
```bash
npx drizzle-kit push
```
…or apply the provided SQL file:
```bash
mysql -u root -p < database/schema.mysql.sql
```

### 5. Load sample data
```bash
npx tsx src/db/seed.ts
```

### 6. Run
```bash
npm run dev
```

Open **http://localhost:3000**

---

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@college.edu` | `admin123` |
| Lab Admin | `lab@college.edu` | `lab123` |

---

## Using PostgreSQL Instead

The data layer is dialect-aware. Set:
```env
DB_DIALECT=postgresql
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```
Then `npx drizzle-kit push` and `npx tsx src/db/seed.ts`.

Everything else is identical — no code changes needed.

---

## How the Dialect Switch Works

```
src/db/
├── schema.pg.ts       PostgreSQL table definitions
├── schema.mysql.ts    MySQL table definitions
├── schema.ts          Picks the active schema from DB_DIALECT
├── index.ts           Builds a mysql2 or node-postgres Drizzle client
└── compat.ts          Normalises INSERT/UPDATE ... RETURNING
```

MySQL has no `RETURNING` clause, so `src/db/compat.ts` provides
`insertReturning()`, `updateReturning()` and `insertManyReturning()`.
These use `RETURNING` on PostgreSQL and `insertId` + re-select on MySQL,
so the application code is identical on both.

`drizzle.config.ts` reads `DB_DIALECT` too, so `drizzle-kit push` /
`generate` / `studio` always target the right database.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npx drizzle-kit push` | Apply schema to the active database |
| `npx drizzle-kit generate` | Generate SQL migration files |
| `npx drizzle-kit studio` | Database GUI in the browser |
| `npx tsx src/db/seed.ts` | Reset and reload sample data |

---

## Database Schema (10 tables)

| Table | Purpose |
|-------|---------|
| `admins` | Administrators, roles, status, last login |
| `students` | Students with USN, course, semester, QR id, soft delete |
| `batches` | Batches — name, course, dept, semester, year, capacity, status |
| `batch_students` | Batch ↔ student assignments (unique pair) |
| `computers` | Lab PCs and their live status |
| `lab_sessions` | One row per student session with timings |
| `session_actions` | Per-session activity timeline |
| `audit_logs` | Every administrative operation |
| `login_attempts` | Success/failure, IP, reason, rate limiting |
| `notifications` | User notifications |

> `batches` intentionally has **no** `batch_code` and **no** `section` column.

---

## Core Workflow

```
Login → Dashboard → Select Batch → Students Auto-Load
→ Select Students → Validate → Auto-Assign Computers
→ Start Sessions → Live Timers → End Session
→ Summary → Action History → Reports
```

### Rules enforced server-side
1. Batch must be **active**
2. Only students **in the batch** can be selected
3. Only **active** students can start a session
4. A student cannot hold **two active sessions**
5. A computer cannot hold **two active sessions**
6. Occupied / maintenance / offline PCs are never assigned
7. Allocation runs inside a **transaction**
8. Insufficient computers returns an explicit error — never a partial silent insert

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              Login
│   ├── (app)/                Protected dashboard routes
│   │   ├── dashboard/  students/  batches/  sessions/
│   │   ├── computers/  reports/   audit/    profile/  settings/
│   └── api/                  12 REST endpoints
├── components/
│   ├── dashboard-layout.tsx  Sidebar + header shell
│   └── theme-provider.tsx    Dark / light / system
├── db/                       Dialect-aware data layer
└── lib/auth.ts               JWT, bcrypt, RBAC

database/schema.mysql.sql     Standalone MySQL DDL
drizzle/mysql/                Generated MySQL migrations
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Unknown database 'nizzu'` | `CREATE DATABASE nizzu CHARACTER SET utf8mb4;` |
| `Access denied for user` | Check `DB_USER` / `DB_PASSWORD` in `.env` |
| `ER_NOT_SUPPORTED_AUTH_MODE` | `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'nizzusql@11';` |
| `Table 'nizzu.students' doesn't exist` | `npx drizzle-kit push` |
| Wrong dialect being used | Confirm `DB_DIALECT=mysql` is in `.env` |
| Port 3000 busy | `npm run dev -- -p 3001` |
| Reset all data | `npx tsx src/db/seed.ts` |

---

## Security Notes

- Passwords hashed with **bcrypt** (cost 12) — never stored in plain text
- **JWT** in httpOnly, SameSite=Lax cookies
- **Rate limiting**: 5 failed logins per hour per email
- All authorisation checks run **server-side**; menu hiding is cosmetic only
- Every mutation is written to `audit_logs`
- Parameterised queries via Drizzle — no string-concatenated SQL
- `.env` is git-ignored; `.env.example` is the committed template

---

© 2026 BCA Final Year Project
