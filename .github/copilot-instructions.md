# AI Agent Instructions - Campus Connect Event Management

## Project Overview

**Campus Connect** is a full-stack event management system for Purdue Fort Wayne. Students browse/RSVP events; organizers create/manage events; admins oversee the system. Built with Next.js 15 (frontend) and Express.js (backend) using PostgreSQL with raw `pg` library (no ORM).

**Tech Stack:** Next.js 15, React 19, Express.js, PostgreSQL, JWT auth, Shadcn/ui + Tailwind CSS

## Critical Architecture Decisions

### Raw SQL over ORM

The codebase uses raw SQL with the `pg` library instead of Prisma. This is **intentional** for:

- Educational value (learning actual database queries)
- Direct SQL control and debugging
- Simplified setup (no code generation)

**Pattern:** All DB queries use `import { query } from '../db.js'` with parameterized queries to prevent SQL injection.

### Database Structure

- **users**: Stores user accounts with roles (student/organizer/admin)
- **events**: Events created by organizers with status (draft/published/cancelled)
- **event_attendees**: Junction table for RSVP tracking
- **user_profiles**: Extended user info
- See [backend/db/README.md](../backend/db/README.md) for schema details

### Authentication Model

- JWT tokens stored in `localStorage` (frontend) and `Authorization: Bearer <token>` headers
- Backend validates tokens in [src/middleware/auth.js](../backend/src/middleware/auth.js)
- Three roles: `student`, `organizer`, `admin` with specific route protections
- `authenticate` middleware: validates token, extracts user
- `requireOrganizer` / `requireAdmin`: role-based access control

## Project Structure

```
event-management/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── index.js      # Server entry point, routes mounting
│   │   ├── db.js         # PostgreSQL connection pool & query function
│   │   ├── routes/       # API endpoints (auth, events, rsvp, admin, upload, profile)
│   │   ├── middleware/   # Auth, rate limiting, file upload
│   │   ├── services/     # Email templates & transporter
│   │   └── utils/        # Validation helpers
│   └── db/               # SQL migration scripts
├── frontend/             # Next.js 15 app (App Router)
│   ├── app/              # Pages and layouts
│   ├── components/       # Reusable React components (organized by feature)
│   ├── lib/              # Utilities: auth-context, calendar export, constants
│   └── public/           # Static assets
└── package.json          # Root-level scripts for running entire system
```

## Core Development Workflows

### Setup & Running

```bash
# Root-level scripts (one command runs both backend + frontend)
npm run dev              # Concurrently starts backend (port 4000) + frontend (port 3000)

# Individual services
npm run backend:dev      # Just backend
npm run frontend:dev     # Just frontend
npm run install:all      # Install all dependencies across root + backend + frontend
```

**Environment Variables:**

- Backend: `.env` in `backend/` (DATABASE_URL, JWT_SECRET, EMAIL_HOST, EMAIL_USER, PORT)
- Frontend: `.env.local` in `frontend/` (NEXT_PUBLIC_API_URL=http://localhost:4000/api)

### Testing

```bash
npm test                 # Runs unit tests for backend + frontend in parallel
npm run test:e2e         # Runs Cypress e2e tests (starts server, opens browser)
npm run test:e2e:run     # Runs e2e tests headless
```

**Test Framework:** Mocha + Chai (backend), Cypress (e2e frontend)

## Code Patterns & Conventions

### Backend: API Routes

Express routes follow RESTful pattern with consistent response format:

```javascript
// src/routes/events.js pattern:
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT ... WHERE id = $1', [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Not found' });
    res.json(formatResponse(result.rows[0]));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Operation failed' });
  }
});
```

**Key conventions:**

- All routes return JSON; use parameterized queries ($1, $2, etc.)
- Wrap in try-catch with console.error logging
- Apply `authenticate` middleware when user auth required
- Map database snake_case columns to camelCase for frontend
- Return 404 if resource not found, 500 for server errors

### Database Queries

All queries use the `query()` function with parameterized placeholders:

```javascript
const result = await query(
  'SELECT * FROM events WHERE user_id = $1 AND status = $2',
  [userId, 'published'],
);
```

**Never** concatenate user input; always use `$n` placeholders.

### Frontend: Component Patterns

- **Page components** (`app/*/page.jsx`): Use `'use client'` directive, fetch data client-side or via API
- **Feature components** (`components/*/`): Organized by feature (auth/, event-detail/, calendar/, etc.)
- **Form components**: Use React Hook Form + Yup validation + Shadcn/ui inputs
- **Authentication**: Access user via `useAuth()` from [lib/auth-context.js](../frontend/lib/auth-context.js)

**Example pattern:**

```javascript
'use client';
import { useAuth } from '@/lib/auth-context';

export default function MyComponent() {
  const { user, signin, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  // ...
}
```

### Email System

Located in [backend/src/services/email.js](../backend/src/services/email.js):

- Uses Nodemailer with Gmail SMTP
- Environment variables: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD
- Email templates in [email-templates.js](../backend/src/services/email-templates.js)
- Methods: `sendEventUpdateEmail()`, `sendEventCancellationEmail()`, etc.

### File Upload

- Handled via [src/middleware/upload.js](../backend/src/middleware/upload.js) (Multer)
- Integrates with Cloudinary for image storage
- Route: `POST /api/upload` (requires auth)
- Returns image URL for use in event creation

### Rate Limiting

Applied globally to all `/api/` routes via [src/middleware/rate-limit.js](../backend/src/middleware/rate-limit.js):

- Prevents brute-force attacks on auth endpoints
- Uses `express-rate-limit`

## Common Tasks & Patterns

### Adding a New API Endpoint

1. Create route in [backend/src/routes/](../backend/src/routes/)
2. Mount in [backend/src/index.js](../backend/src/index.js): `app.use('/api/yourroute', yourRoutes)`
3. Use `authenticate` / `requireOrganizer` / `requireAdmin` middleware as needed
4. Wrap in try-catch, use parameterized `query()`, return JSON

### Modifying Database Schema

1. Create new `.sql` file in [backend/db/](../backend/db/)
2. Document migration in [backend/db/README.md](../backend/db/README.md)
3. Run manually or via setup script
4. Update queries in backend routes to use new columns

### Adding a Frontend Page

1. Create `app/yourpath/page.jsx` with `'use client'` if interactive
2. Create feature components in `components/yourfeature/`
3. Use [lib/auth-context.js](../frontend/lib/auth-context.js) for auth state
4. Fetch from `${process.env.NEXT_PUBLIC_API_URL}/api/...` with JWT header
5. Style with Tailwind CSS + Shadcn/ui components

## Integration Points & External Dependencies

### Backend Dependencies

- **Express.js 5.x**: HTTP server framework
- **pg**: PostgreSQL driver (raw SQL, not ORM)
- **jsonwebtoken**: JWT token creation/verification
- **bcrypt**: Password hashing
- **nodemailer**: Email sending
- **multer**: File upload handling
- **cloudinary**: Image storage/CDN
- **helmet**: HTTP security headers
- **cors**: Cross-origin request handling
- **express-rate-limit**: Rate limiting

### Frontend Dependencies

- **Next.js 15**: React meta-framework (App Router)
- **React 19**: UI library
- **shadcn/ui**: Component library (Radix UI primitives + Tailwind CSS)
- **react-hook-form** + **yup**: Form state & validation
- **date-fns**: Date manipulation
- **next-themes**: Dark mode support
- **ics**: iCalendar format (calendar export)

### External Services

- **Gmail SMTP**: Email delivery (configured via .env)
- **Cloudinary**: Image hosting for event photos

## Testing Guidelines

- **Backend unit tests**: `backend/test/` with Mocha/Chai
- **Frontend e2e tests**: `frontend/cypress/e2e/` with Cypress
- Test auth with JWT tokens; mock external services
- Run `npm test` before committing

## Debugging Tips

1. **Backend issues**: Check `.env` DATABASE_URL, JWT_SECRET. Use console.error logs in routes.
2. **Auth failures**: Verify token format (`Bearer <token>`), check JWT_SECRET matches frontend.
3. **Database errors**: Review [backend/db/README.md](../backend/db/README.md), run SQL script manually to test.
4. **Frontend API calls**: Open DevTools Network tab, verify `NEXT_PUBLIC_API_URL` is correct.
5. **Email not sending**: Test `/api/email-status` endpoint, verify Gmail app password.

## Key Files Reference

| File                                                                | Purpose                           |
| ------------------------------------------------------------------- | --------------------------------- |
| [backend/src/index.js](../backend/src/index.js)                     | Express app setup, route mounting |
| [backend/src/db.js](../backend/src/db.js)                           | PostgreSQL pool & query helper    |
| [backend/src/middleware/auth.js](../backend/src/middleware/auth.js) | JWT validation & role checks      |
| [backend/src/routes/events.js](../backend/src/routes/events.js)     | Event CRUD API                    |
| [frontend/lib/auth-context.js](../frontend/lib/auth-context.js)     | Auth state management             |
| [backend/db/README.md](../backend/db/README.md)                     | Database schema documentation     |
