# Security Guide - Event Management Application

## 🔒 Security Measures Implemented

This document outlines all security measures implemented in the Event Management Application and best practices for maintaining security in production.

## Critical Security Fixes Applied

### ✅ 1. Credential Management

**Problem:** `.env` files with production credentials were tracked in git

**Solution:**
- Created `.env.example` templates without real credentials
- Added `.env` to `.gitignore`
- **Action Required:** Remove `.env` from git history before deployment

**To remove from git history:**
```bash
# Method 1: Using git-filter-repo (recommended)
git filter-repo --path backend/.env --invert-paths
git filter-repo --path frontend/.env --invert-paths

# Method 2: Using BFG Repo Cleaner
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push to remote
git push origin --force --all
```

**Post-cleanup checklist:**
- [ ] Regenerate ALL credentials (database, JWT, Cloudinary, email)
- [ ] Rotate API keys in all services
- [ ] Update production environment variables

### ✅ 2. Rate Limiting

**Implementation:**
- Auth endpoints: 5 attempts per 15 minutes (prevents brute force)
- RSVP endpoints: 10 requests per minute (prevents spam)
- General API: 100 requests per 15 minutes

**Files:**
- `/backend/src/middleware/rate-limit.js` - Rate limiter configuration
- `/backend/src/index.js` - Applied to routes

**Testing:**
```bash
# Test auth rate limiting
for i in {1..6}; do
  curl -X POST http://localhost:4000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# 6th request should return 429
```

### ✅ 3. CORS Configuration

**Problem:** `app.use(cors())` accepted requests from any origin

**Solution:**
- Restricted to specific frontend URL
- Credentials enabled for cookie/auth
- Only allowed methods: GET, POST, PUT, DELETE, PATCH

**Configuration:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### ✅ 4. Security Headers (Helmet)

**Enhanced configuration:**
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- XSS Protection

**Implementation:**
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
}));
```

### ✅ 5. HTTPS Enforcement

**Production only:**
```javascript
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

## Data Integrity & Race Condition Fixes

### ✅ 1. Reward Redemption Transaction

**Problem:** Concurrent redemptions could cause double point deduction

**Solution:**
- Database transaction with BEGIN/COMMIT/ROLLBACK
- Row-level locking with `FOR UPDATE`
- Idempotency check (prevent duplicate redemptions within 5 seconds)
- Atomic point deduction

**File:** `/backend/src/routes/rewards.js`

**Key pattern:**
```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');

  // Lock rows
  const reward = await client.query('SELECT * FROM rewards WHERE id = $1 FOR UPDATE', [id]);
  const user = await client.query('SELECT * FROM users WHERE id = $1 FOR UPDATE', [userId]);

  // Idempotency check
  const recent = await client.query(
    'SELECT * FROM redemptions WHERE user_id = $1 AND reward_id = $2 AND redeemed_at > NOW() - INTERVAL \'5 seconds\'',
    [userId, id]
  );

  if (recent.rows.length > 0) {
    await client.query('ROLLBACK');
    return res.status(400).json({ error: 'Duplicate redemption' });
  }

  // Perform operations...
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

### ✅ 2. Event Check-in Transaction

**Problem:** Concurrent check-ins could cause duplicate point awards

**Solution:** Same transaction pattern as reward redemption

**File:** `/backend/src/routes/events.js`

### ✅ 3. Database Constraints

**Migration:** `/backend/db/migrations/04_production_constraints.sql`

**Constraints:**
- Prevent negative points: `CHECK (total_points >= 0)`
- Prevent negative reward costs: `CHECK (cost > 0)`
- Prevent negative event points: `CHECK (points >= 0)`
- Unique check-in per user/event: `UNIQUE INDEX idx_unique_checkin`
- Positive capacity: `CHECK (capacity IS NULL OR capacity > 0)`

## Input Validation & Sanitization

### ✅ 1. Request Validation

**Library:** `express-validator`

**Middleware:** `/backend/src/middleware/validation.js`

**Validations:**
- Email format (RFC 5322 compliant)
- Password strength (min 8 chars, uppercase, lowercase, number)
- Name format (letters, spaces, hyphens, apostrophes only)
- Event fields (title, description, capacity, dates)
- UUID format for IDs
- Role validation (student, organizer, admin)

**Usage:**
```javascript
router.post('/signup',
  validateEmail(),
  validatePassword(),
  validateName('firstName'),
  handleValidationErrors,
  async (req, res) => { ... }
);
```

### ✅ 2. Sanitization

**Libraries:**
- `express-mongo-sanitize` - Prevents NoSQL injection
- `xss-clean` - Prevents XSS attacks

**Applied globally:**
```javascript
app.use(mongoSanitize());
app.use(xss());
```

## Authentication & Authorization

### 🔐 JWT Configuration

**Current:**
```javascript
const token = jwt.sign(
  { userId, email, role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Best Practices:**
- ✅ Secret stored in environment variable
- ✅ Token expiration set (7 days)
- ✅ Includes user role for authorization
- ⚠️ **Action Required:** Ensure JWT_SECRET is 64+ bytes in production

**Generate secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 🔑 Password Hashing

**Implementation:**
```javascript
const passwordHash = await bcrypt.hash(password, 10);
```

**Verification:**
```javascript
const isValid = await bcrypt.compare(password, user.passwordHash);
```

**Security level:** 10 rounds (recommended for bcrypt)

## Database Security

### ✅ 1. Connection Pool Security

**Configuration:**
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  min: 5,
  statement_timeout: 10000, // Prevent long-running queries
  query_timeout: 10000,
});
```

**Error handling:**
- Graceful error handling in production (no process exit)
- Logging instead of exposing errors

### ✅ 2. SQL Injection Prevention

**All queries use parameterized statements:**
```javascript
// ✅ SAFE
await query('SELECT * FROM users WHERE email = $1', [email]);

// ❌ NEVER DO THIS
await query(`SELECT * FROM users WHERE email = '${email}'`);
```

### ✅ 3. Performance Indexes

**Migration:** `/backend/db/migrations/05_performance_indexes.sql`

**Indexes created:**
- Leaderboard queries (users.total_points DESC)
- Event listings (status, start_date, category)
- RSVP queries (user_id, event_id, status)
- Notifications (user_id, is_read, created_at)
- User lookups (email, role)

## Monitoring & Logging

### ✅ 1. Winston Logging

**File:** `/backend/src/utils/logger.js`

**Features:**
- Structured JSON logging
- Separate error.log and combined.log
- Log rotation (5MB max, 5 files)
- Environment-specific formatting

**Usage:**
```javascript
import logger from './utils/logger.js';

logger.info('User signed up', { userId, email });
logger.error('Database error', { error: err.message, stack: err.stack });
```

### ✅ 2. Sentry Error Tracking

**Configuration:**
```javascript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% in production
});
```

**Features:**
- Real-time error tracking
- Stack traces
- Request context
- Performance monitoring

## Security Testing Checklist

### Pre-Deployment Security Audit

- [ ] Run `npm audit` and fix critical/high vulnerabilities
  ```bash
  npm audit
  npm audit fix
  ```

- [ ] Test authentication flows
  - [ ] Sign up with weak password (should fail)
  - [ ] Sign up with duplicate email (should fail)
  - [ ] Sign in with wrong password (should fail after 5 attempts)
  - [ ] Access protected routes without token (should return 401)

- [ ] Test authorization
  - [ ] Student accessing admin routes (should return 403)
  - [ ] Organizer accessing other's events (should return 403)

- [ ] Test rate limiting
  - [ ] Make 6 rapid auth requests (6th should fail)
  - [ ] Make 11 rapid RSVP requests (11th should fail)

- [ ] Test CORS
  - [ ] Request from unauthorized origin (should be blocked)
  - [ ] Request from authorized origin (should succeed)

- [ ] Test input validation
  - [ ] Submit malformed email (should fail)
  - [ ] Submit SQL injection payload (should be sanitized)
  - [ ] Submit XSS payload (should be sanitized)
  - [ ] Submit negative reward cost (should fail)

- [ ] Test race conditions
  - [ ] Concurrent reward redemptions (should prevent duplicates)
  - [ ] Concurrent check-ins (should prevent duplicates)

- [ ] Test HTTPS
  - [ ] HTTP request redirects to HTTPS
  - [ ] HSTS header present
  - [ ] SSL certificate valid

## Environment Variables Security

### Required Environment Variables

**Backend:**
```bash
DATABASE_URL=postgresql://...  # Strong password, 16+ chars
JWT_SECRET=...                  # 64-byte hex string
CLOUDINARY_API_SECRET=...       # Regenerated
EMAIL_PASSWORD=...              # App-specific password
FRONTEND_URL=https://...        # Exact frontend URL
SENTRY_DSN=...                  # Optional
```

**Frontend:**
```bash
NEXT_PUBLIC_API_URL=https://... # Backend URL
```

### Credential Rotation Schedule

**Recommended rotation:**
- JWT_SECRET: Every 90 days
- Database password: Every 90 days
- Cloudinary keys: Every 180 days
- Email password: Every 180 days

**After rotation:**
1. Update environment variables in deployment platform
2. Restart services
3. Verify all services functional

## Incident Response

### If credentials are leaked:

1. **Immediate actions:**
   - Rotate ALL credentials immediately
   - Check access logs for suspicious activity
   - Revoke compromised tokens
   - Force password reset for affected users

2. **Investigation:**
   - Review git history
   - Check deployment logs
   - Examine error tracking (Sentry)
   - Review database logs

3. **Prevention:**
   - Use secret scanning tools (GitHub Secret Scanning)
   - Set up alerts for exposed secrets
   - Educate team on security practices

### Security Contact

For security vulnerabilities, contact: [your-email@example.com]

## Compliance

### Data Protection

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens expire after 7 days
- ✅ HTTPS encryption for all data in transit
- ✅ Database credentials encrypted at rest
- ✅ No sensitive data in logs

### GDPR Considerations

**Data collected:**
- User name, email
- Event attendance records
- Points and redemptions

**User rights:**
- Right to access: Implement user data export
- Right to deletion: Implement account deletion
- Right to rectification: Allow profile updates

**Recommendations:**
1. Add privacy policy
2. Implement consent mechanism
3. Add data export feature
4. Add account deletion feature
5. Log data access for audit trail

## Regular Security Maintenance

### Weekly
- [ ] Review error logs
- [ ] Check for failed login attempts
- [ ] Monitor API rate limit hits

### Monthly
- [ ] Run `npm audit`
- [ ] Review Sentry error reports
- [ ] Check database backup status
- [ ] Review access logs

### Quarterly
- [ ] Rotate credentials
- [ ] Security penetration testing
- [ ] Update dependencies
- [ ] Review security policies

### Annually
- [ ] Full security audit
- [ ] Update disaster recovery plan
- [ ] Review and update security documentation

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)
