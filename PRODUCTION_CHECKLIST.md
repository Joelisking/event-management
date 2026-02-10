# Production Readiness Checklist

This checklist ensures all security fixes, optimizations, and configurations are properly implemented before deploying to production.

## 📋 Pre-Deployment Checklist

### Phase 1: Security ✅

#### Credential Management
- [ ] Remove `.env` files from git history
  ```bash
  git filter-repo --path backend/.env --invert-paths
  git filter-repo --path frontend/.env --invert-paths
  git push origin --force --all
  ```
- [ ] Verify `.gitignore` contains `.env` patterns
- [ ] Create `.env.example` files (✅ Done)
- [ ] Generate new JWT secret (64 bytes)
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] Regenerate Cloudinary API credentials
- [ ] Create new database user with strong password (16+ chars)
- [ ] Generate new Gmail app password
- [ ] Update all credentials in local `.env` (not committed)

#### Rate Limiting
- [ ] Rate limiting enabled (✅ Done in code)
- [ ] Test auth rate limiting (5 attempts per 15 min)
  ```bash
  for i in {1..6}; do curl -X POST http://localhost:4000/api/auth/signin -H "Content-Type: application/json" -d '{"email":"test","password":"test"}'; done
  ```
- [ ] Test RSVP rate limiting (10 per minute)
- [ ] Test general API rate limiting (100 per 15 min)

#### CORS Configuration
- [ ] CORS restricted to frontend URL (✅ Done)
- [ ] Verify `FRONTEND_URL` in `.env`
- [ ] Test CORS from unauthorized origin (should fail)
- [ ] Test CORS from authorized origin (should succeed)

#### Security Headers
- [ ] Helmet configured with CSP (✅ Done)
- [ ] HSTS enabled (✅ Done)
- [ ] Verify headers in browser DevTools

#### HTTPS Enforcement
- [ ] HTTPS redirect enabled for production (✅ Done)
- [ ] Test HTTP → HTTPS redirect

#### Input Validation
- [ ] Validation middleware created (✅ Done)
- [ ] Applied to auth routes (✅ Done)
- [ ] Test invalid email format (should return 400)
- [ ] Test weak password (should return 400)
- [ ] Test XSS payload (should be sanitized)
- [ ] Test SQL injection (should be sanitized)

### Phase 2: Data Integrity ✅

#### Transaction Implementation
- [ ] Reward redemption uses transactions (✅ Done)
- [ ] Check-in uses transactions (✅ Done)
- [ ] Test concurrent reward redemption
  ```bash
  # Simulate 2 concurrent requests
  curl -X POST http://localhost:4000/api/rewards/1/redeem -H "Authorization: Bearer TOKEN" & \
  curl -X POST http://localhost:4000/api/rewards/1/redeem -H "Authorization: Bearer TOKEN" &
  ```
- [ ] Test concurrent check-ins

#### Database Constraints
- [ ] Migration 04 created (✅ Done)
- [ ] Run constraint migration on local DB
  ```bash
  psql $DATABASE_URL -f backend/db/migrations/04_production_constraints.sql
  ```
- [ ] Test negative points prevention
- [ ] Test duplicate check-in prevention
- [ ] Verify unique constraint on check-ins

#### Performance Indexes
- [ ] Migration 05 created (✅ Done)
- [ ] Run index migration on local DB
  ```bash
  psql $DATABASE_URL -f backend/db/migrations/05_performance_indexes.sql
  ```
- [ ] Verify indexes created
  ```sql
  SELECT indexname FROM pg_indexes WHERE tablename IN ('users', 'events', 'event_attendees', 'notifications');
  ```

### Phase 3: Performance ✅

#### Database Optimization
- [ ] Connection pool optimized (✅ Done)
- [ ] Query timeouts configured (✅ Done)
- [ ] Min connections set to 5 (✅ Done)

#### Caching
- [ ] Response caching implemented (✅ Done)
- [ ] Events cached for 5 minutes (production only)
- [ ] Rewards cached for 30 minutes (production only)
- [ ] Leaderboard cached for 10 minutes (production only)
- [ ] Test cache headers in production

#### Load Testing
- [ ] Install Artillery
  ```bash
  npm install -g artillery
  ```
- [ ] Run load test
  ```bash
  artillery quick --count 100 --num 10 http://localhost:4000/api/events
  ```
- [ ] Verify response times < 500ms for 95th percentile
- [ ] Verify no errors under load

### Phase 4: Monitoring & Logging ✅

#### Winston Logging
- [ ] Logger utility created (✅ Done)
- [ ] Logs directory created (✅ Done)
- [ ] Logs added to `.gitignore` (✅ Done)
- [ ] Console logs replaced with logger
- [ ] Test log rotation (create 5MB+ logs)

#### Sentry Integration
- [ ] Sentry installed (✅ Done)
- [ ] Sentry configured (✅ Done)
- [ ] Create Sentry account at sentry.io
- [ ] Get Sentry DSN
- [ ] Add `SENTRY_DSN` to environment variables
- [ ] Test error tracking (trigger an error)
- [ ] Verify error appears in Sentry dashboard

#### Health Check
- [ ] Enhanced health check implemented (✅ Done)
- [ ] Test health endpoint
  ```bash
  curl http://localhost:4000/health
  ```
- [ ] Verify database connection check works

### Phase 5: Deployment Configuration ✅

#### Backend Configuration
- [ ] `railway.json` created (✅ Done)
- [ ] `render.yaml` created (✅ Done)
- [ ] `package.json` scripts updated (✅ Done)
- [ ] Test migration scripts locally
  ```bash
  npm run migrate:all
  ```

#### Frontend Configuration
- [ ] `vercel.json` created (✅ Done)
- [ ] `next.config.js` optimized (✅ Done)
- [ ] `.env.production.example` created (✅ Done)

#### Environment Variables
- [ ] List all required backend env vars
- [ ] List all required frontend env vars
- [ ] Prepare values for production (without committing)

### Phase 6: Testing ✅

#### Security Testing
- [ ] Run npm audit
  ```bash
  cd backend && npm audit
  cd frontend && npm audit
  ```
- [ ] Fix critical and high vulnerabilities
- [ ] Test authentication flows
  - [ ] Sign up new user
  - [ ] Sign in with correct credentials
  - [ ] Sign in with wrong credentials (rate limit test)
  - [ ] Access protected route without token
- [ ] Test authorization
  - [ ] Student accessing admin routes
  - [ ] Organizer accessing other's events
  - [ ] Admin accessing all features

#### Functionality Testing
- [ ] Complete user journey test:
  1. [ ] Sign up as student
  2. [ ] Browse events
  3. [ ] RSVP to event
  4. [ ] Check-in via QR code
  5. [ ] Verify points awarded
  6. [ ] View leaderboard
  7. [ ] Redeem reward
  8. [ ] Check notifications
- [ ] Email notifications work
  - [ ] Welcome email
  - [ ] RSVP confirmation
  - [ ] Event reminder
  - [ ] Event cancellation
- [ ] QR code generation works
- [ ] QR scanner works on mobile
- [ ] Image uploads work (Cloudinary)
- [ ] Calendar export works

#### Cross-Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Mobile Chrome

#### Performance Testing
- [ ] Lighthouse score > 80 (performance)
- [ ] Response times < 500ms
- [ ] No memory leaks (run for extended period)
- [ ] Bundle size < 500KB (frontend)

### Phase 7: Deployment 🚀

#### Backend Deployment
- [ ] Choose platform (Railway or Render)
- [ ] Create new project
- [ ] Add PostgreSQL database
- [ ] Configure environment variables
- [ ] Deploy backend
- [ ] Verify deployment successful
- [ ] Run database migrations
  ```bash
  railway run npm run migrate:all
  # or
  render run npm run migrate:all
  ```
- [ ] Test health endpoint
- [ ] Verify HTTPS works

#### Frontend Deployment
- [ ] Create Vercel project
- [ ] Configure environment variable (`NEXT_PUBLIC_API_URL`)
- [ ] Deploy frontend
- [ ] Verify deployment successful
- [ ] Test frontend loads
- [ ] Verify API calls work

#### Post-Deployment
- [ ] Update CORS origin to production frontend URL
- [ ] Restart backend service
- [ ] Test complete user journey on production
- [ ] Verify HTTPS lock icon
- [ ] Check browser console for errors
- [ ] Verify analytics/monitoring working

### Phase 8: Monitoring Setup 📊

#### Uptime Monitoring
- [ ] Set up UptimeRobot or similar
- [ ] Monitor backend health endpoint
- [ ] Monitor frontend homepage
- [ ] Configure email alerts

#### Error Monitoring
- [ ] Verify Sentry receiving errors
- [ ] Set up Sentry alerts
- [ ] Configure alert channels (email, Slack)

#### Logging
- [ ] Verify logs accessible in platform dashboard
- [ ] Set up log retention policy
- [ ] Configure log alerts for errors

### Phase 9: Documentation 📚

- [ ] Deployment guide created (✅ Done)
- [ ] Security guide created (✅ Done)
- [ ] Update README with production info
- [ ] Document environment variables
- [ ] Create runbook for common issues

### Phase 10: Final Verification ✅

#### Pre-Launch Security Check
- [ ] No `.env` files in git
- [ ] All credentials regenerated
- [ ] Rate limiting active
- [ ] CORS restricted
- [ ] HTTPS enforced
- [ ] Input validation working
- [ ] Transaction isolation working
- [ ] Database constraints active
- [ ] No sensitive data in logs
- [ ] Error messages don't leak info

#### Performance Check
- [ ] Database indexes active
- [ ] Response caching working
- [ ] Load test passed
- [ ] No slow queries (check logs)
- [ ] Frontend bundle optimized

#### Functionality Check
- [ ] All features working
- [ ] Email sending working
- [ ] Image uploads working
- [ ] QR codes generating
- [ ] Notifications appearing
- [ ] Leaderboard updating
- [ ] Rewards redeemable

## 🎯 Go/No-Go Decision

### GO Criteria (All must be ✅)

- ✅ All security vulnerabilities fixed
- ✅ All credentials regenerated and secured
- ✅ Rate limiting enabled and tested
- ✅ CORS properly configured
- ✅ HTTPS enforced
- ✅ Input validation working
- ✅ Race conditions fixed
- ✅ Database constraints active
- ✅ Performance benchmarks met
- ✅ Complete user journey tested
- ✅ Monitoring configured
- ✅ Rollback plan documented

### NO-GO Criteria (Any of these = delay)

- ❌ Critical security vulnerabilities unfixed
- ❌ Database migrations failed
- ❌ Race conditions still present
- ❌ Rate limiting not working
- ❌ Authentication/authorization broken
- ❌ Email notifications failing
- ❌ Major functionality broken
- ❌ Performance < 500ms response time
- ❌ No monitoring configured
- ❌ No rollback plan

## 🔄 Rollback Plan

If issues occur post-deployment:

1. **Frontend rollback:**
   - Vercel dashboard → Deployments → Promote previous version
   - Takes ~1 minute

2. **Backend rollback:**
   - Railway/Render dashboard → Revert deployment
   - Takes ~2-3 minutes

3. **Database rollback:**
   - **Do NOT rollback migrations**
   - Restore from backup if needed
   - Railway provides automatic backups

4. **Emergency contact:**
   - Platform status pages
   - Support channels
   - Team notification

## 📞 Post-Launch Monitoring

### First 24 Hours
- [ ] Monitor error rates every hour
- [ ] Check response times
- [ ] Verify user sign-ups working
- [ ] Monitor database performance
- [ ] Check Sentry for new errors
- [ ] Review logs for anomalies

### First Week
- [ ] Daily error rate check
- [ ] Performance monitoring
- [ ] User feedback review
- [ ] Database query optimization
- [ ] Adjust rate limits if needed

### First Month
- [ ] Weekly security audit
- [ ] Performance optimization
- [ ] User analytics review
- [ ] Cost optimization
- [ ] Feature usage analysis

## ✅ Sign-Off

**Prepared by:** _________________
**Date:** _________________

**Reviewed by:** _________________
**Date:** _________________

**Approved for deployment:** _________________
**Date:** _________________

---

**Production deployment authorized: [ ] YES [ ] NO**

**If NO, reasons:** ___________________________________________
