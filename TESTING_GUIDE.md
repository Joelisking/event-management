# Comprehensive Testing Guide - Event Management System

This guide provides step-by-step instructions for testing the entire Event Management System end-to-end, covering all features, security measures, and edge cases.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Security Testing](#security-testing)
4. [Authentication & Authorization Testing](#authentication--authorization-testing)
5. [Event Management Testing](#event-management-testing)
6. [RSVP & Attendance Testing](#rsvp--attendance-testing)
7. [Gamification Features Testing](#gamification-features-testing)
8. [Admin Dashboard Testing](#admin-dashboard-testing)
9. [Performance Testing](#performance-testing)
10. [Mobile & Cross-Browser Testing](#mobile--cross-browser-testing)
11. [Data Integrity Testing](#data-integrity-testing)
12. [Error Handling Testing](#error-handling-testing)

---

## Prerequisites

### Required Tools
- Modern web browser (Chrome, Firefox, Safari)
- Mobile device or mobile emulator
- Postman or curl for API testing
- PostgreSQL client (psql)
- Git bash or terminal

### Test Data Required
- At least 2 test user accounts (student, organizer). Organizers have full admin privileges.
- 5+ test events
- Test images for uploads
- QR code scanner app on mobile

### Test Environment URLs
- **Local:**
  - Frontend: http://localhost:3000
  - Backend: http://localhost:4000
- **Production:**
  - Frontend: https://your-app.vercel.app
  - Backend: https://your-backend.railway.app

---

## Environment Setup

### 1. Start Local Development Environment

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Monitor logs
cd backend
tail -f logs/combined.log
```

### 2. Verify Services Running

**Backend Health Check:**
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-02-09T...",
  "uptime": 12.34,
  "database": "connected",
  "environment": "development"
}
```

**Frontend:**
- Open http://localhost:3000
- Should see homepage without errors

### 3. Database Setup

```bash
# Verify database connection
psql $DATABASE_URL -c "SELECT NOW();"

# Run migrations if needed
npm run migrate:all
```

---

## Security Testing

### Test 1: Rate Limiting

#### Test 1.1: Auth Rate Limiting (5 attempts per 15 min)

**Purpose:** Prevent brute force attacks

**Steps:**
1. Open Postman or terminal
2. Make 6 rapid POST requests to `/api/auth/signin` with wrong credentials

```bash
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST http://localhost:4000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrongpassword"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

**Expected Results:**
- Requests 1-5: Return 401 (Unauthorized)
- Request 6: Return 429 (Too Many Requests)
- Response body: `{"error":"Too many attempts, please try again later"}`

**Success Criteria:** ✅ 6th request blocked with 429 status

---

#### Test 1.2: RSVP Rate Limiting (10 per minute)

**Purpose:** Prevent RSVP spam

**Steps:**
1. Sign in and get auth token
2. Make 11 rapid RSVP requests to same event

```bash
# Get token first
TOKEN="your-jwt-token-here"

for i in {1..11}; do
  echo "RSVP Request $i:"
  curl -X POST http://localhost:4000/api/rsvp \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"eventId":"event-id-here"}' \
    -w "\nStatus: %{http_code}\n\n"
  sleep 0.1
done
```

**Expected Results:**
- Requests 1-10: Process normally
- Request 11: Return 429
- Response: `{"error":"Too many RSVP requests"}`

**Success Criteria:** ✅ 11th request blocked

---

### Test 2: CORS Security

#### Test 2.1: Unauthorized Origin

**Purpose:** Verify CORS blocks unauthorized domains

**Steps:**
1. Open browser DevTools Console on https://google.com
2. Try to make API request:

```javascript
fetch('http://localhost:4000/api/events')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Expected Results:**
- Console shows CORS error
- Error message: "Access to fetch... has been blocked by CORS policy"

**Success Criteria:** ✅ Request blocked by CORS

---

#### Test 2.2: Authorized Origin

**Purpose:** Verify CORS allows frontend

**Steps:**
1. Open frontend at http://localhost:3000
2. Open DevTools Network tab
3. Navigate to Events page
4. Check API request headers

**Expected Results:**
- Response headers include: `Access-Control-Allow-Origin: http://localhost:3000`
- Requests succeed
- No CORS errors

**Success Criteria:** ✅ Requests allowed from frontend

---

### Test 3: Input Validation

#### Test 3.1: Invalid Email Format

**Purpose:** Prevent malformed emails

**Steps:**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "invalid-email",
    "password": "Password123"
  }'
```

**Expected Results:**
- Status: 400 (Bad Request)
- Error message: `"Invalid email format"`

**Success Criteria:** ✅ Request rejected with validation error

---

#### Test 3.2: Weak Password

**Purpose:** Enforce password strength

**Steps:**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@test.com",
    "password": "weak"
  }'
```

**Expected Results:**
- Status: 400
- Error: Password validation errors (length, uppercase, lowercase, number)

**Success Criteria:** ✅ Weak password rejected

---

#### Test 3.3: XSS Prevention

**Purpose:** Prevent cross-site scripting

**Steps:**
1. Sign up as student
2. Update profile bio with XSS payload:

```bash
curl -X PUT http://localhost:4000/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "<script>alert(\"XSS\")</script>"
  }'
```

3. View profile page

**Expected Results:**
- Script tag is sanitized/escaped
- Alert does not execute
- Bio displays as plain text

**Success Criteria:** ✅ XSS payload neutralized

---

#### Test 3.4: SQL Injection Prevention

**Purpose:** Prevent SQL injection attacks

**Steps:**
```bash
curl -X POST http://localhost:4000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com OR 1=1--",
    "password": "anything"
  }'
```

**Expected Results:**
- Status: 400 or 401
- Login fails
- No database error exposed
- Email validation rejects malformed email

**Success Criteria:** ✅ SQL injection prevented

---

### Test 4: HTTPS Enforcement (Production Only)

**Purpose:** Ensure all traffic uses HTTPS

**Steps:**
```bash
# Test on production URL
curl -I http://your-backend.railway.app/health
```

**Expected Results:**
- Response: 301 (Moved Permanently) or 302 (Found)
- Location header: `https://your-backend.railway.app/health`
- Redirects to HTTPS

**Success Criteria:** ✅ HTTP redirects to HTTPS

---

## Authentication & Authorization Testing

### Test 5: User Sign Up

#### Test 5.1: Student Sign Up

**Steps:**
1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Fill form:
   - First Name: `Test`
   - Last Name: `Student`
   - Email: `student@test.com`
   - Password: `Student123!`
   - Role: `Student`
4. Submit

**Expected Results:**
- Redirects to home/dashboard
- Welcome email sent (check email)
- User token stored in browser
- Navigation shows user name

**Success Criteria:** ✅ Account created, logged in, email sent

---

#### Test 5.2: Organizer Sign Up

**Steps:**
1. Sign up with:
   - Email: `organizer@test.com`
   - Password: `Organizer123!`
   - Role: `Organizer`
   - Organization: `Tech Club`

**Expected Results:**
- Account created
- Organization name saved
- Can access organizer features

**Success Criteria:** ✅ Organizer account with organization

---

#### Test 5.3: Duplicate Email Prevention

**Steps:**
1. Try to sign up again with `student@test.com`

**Expected Results:**
- Error message: "User already exists with this email"
- Sign up fails
- No account created

**Success Criteria:** ✅ Duplicate prevented

---

### Test 6: User Sign In

#### Test 6.1: Successful Sign In

**Steps:**
1. Sign out if logged in
2. Click "Sign In"
3. Enter:
   - Email: `student@test.com`
   - Password: `Student123!`
4. Submit

**Expected Results:**
- Logged in successfully
- Redirected to dashboard
- Token stored
- User name displayed

**Success Criteria:** ✅ Successful login

---

#### Test 6.2: Wrong Password

**Steps:**
1. Try to sign in with wrong password

**Expected Results:**
- Error: "Invalid email or password"
- Login fails
- After 5 attempts, rate limited

**Success Criteria:** ✅ Wrong password rejected, rate limited

---

#### Test 6.3: Non-existent User

**Steps:**
1. Try to sign in with `nonexistent@test.com`

**Expected Results:**
- Error: "Invalid email or password"
- Login fails

**Success Criteria:** ✅ Non-existent user rejected

---

### Test 7: Authorization

#### Test 7.1: Protected Routes

**Steps:**
1. Sign out
2. Try to access http://localhost:3000/profile directly

**Expected Results:**
- Redirected to sign in page
- Or shows "Unauthorized" message

**Success Criteria:** ✅ Protected route blocked

---

#### Test 7.2: Role-Based Access Control

**Steps:**
1. Sign in as student
2. Try to access admin dashboard at http://localhost:3000/admin/dashboard

**Expected Results:**
- Access denied (403 Forbidden)
- Or redirected to home
- Error: "Admin access required"

**Success Criteria:** ✅ Student blocked from admin area

---

#### Test 7.3: Organizer Admin Access

**Steps:**
1. Sign in as organizer
2. Navigate to admin dashboard at http://localhost:3000/admin/dashboard

**Expected Results:**
- Dashboard loads successfully
- Navigation shows "Admin" link
- Can access all admin features: users, events, rewards, stats

**Success Criteria:** ✅ Organizer has full admin access

---

## Event Management Testing

### Test 8: Event Creation (Organizer)

#### Test 8.1: Create Basic Event

**Steps:**
1. Sign in as organizer (`organizer@test.com`)
2. Navigate to "Create Event" or "My Events" → "Create New"
3. Fill form:
   - Title: `Tech Talk: Introduction to AI`
   - Description: `Learn about AI fundamentals`
   - Category: `Technical`
   - Location: `Room 101`
   - Start Date: Tomorrow at 2:00 PM
   - End Date: Tomorrow at 4:00 PM
   - Capacity: `50`
   - Points: `10`
4. Upload event image
5. Submit

**Expected Results:**
- Event created successfully
- Redirected to event details
- QR code generated automatically
- Event appears in "My Events"
- Event visible in public events list

**Success Criteria:** ✅ Event created with all details

---

#### Test 8.2: Event with Invalid Data

**Steps:**
1. Try to create event with:
   - Title: "" (empty)
   - End date before start date
   - Negative capacity
   - Negative points

**Expected Results:**
- Validation errors shown
- Event not created
- Specific error messages for each field

**Success Criteria:** ✅ Invalid data rejected

---

### Test 9: Event Viewing

#### Test 9.1: Browse All Events

**Steps:**
1. Sign in as student
2. Navigate to "Events" page
3. Observe event list

**Expected Results:**
- All active events displayed
- Shows event cards with:
  - Title, image, date, location
  - Organizer name
  - Attendee count
  - Category badge
- Can filter by category
- Can search events

**Success Criteria:** ✅ All events visible and filterable

---

#### Test 9.2: View Event Details

**Steps:**
1. Click on an event card
2. View event details page

**Expected Results:**
- Full event information displayed
- Shows QR code
- Shows attendee list
- RSVP button visible (if not full)
- Shows organizer information
- Can export to calendar

**Success Criteria:** ✅ Complete event details shown

---

### Test 10: Event Management (Organizer)

#### Test 10.1: Edit Event

**Steps:**
1. Sign in as organizer
2. Go to "My Events"
3. Click "Edit" on created event
4. Change title to: `Tech Talk: AI & Machine Learning`
5. Update capacity to `60`
6. Save

**Expected Results:**
- Event updated successfully
- Changes reflected immediately
- Email notification sent to attendees (if configured)
- Updated details visible to all users

**Success Criteria:** ✅ Event updated successfully

---

#### Test 10.2: Cancel Event

**Steps:**
1. Click "Cancel Event"
2. Enter cancellation reason: `Speaker unavailable`
3. Confirm cancellation

**Expected Results:**
- Event status changed to "Cancelled"
- Email sent to all attendees
- Event shows "Cancelled" badge
- RSVPs remain but marked as cancelled
- Points not awarded on check-in

**Success Criteria:** ✅ Event cancelled, notifications sent

---

## RSVP & Attendance Testing

### Test 11: RSVP Flow

#### Test 11.1: Successful RSVP

**Steps:**
1. Sign in as student
2. Browse events
3. Find event with available capacity
4. Click "RSVP" or "Register"
5. Confirm RSVP

**Expected Results:**
- RSVP confirmed
- Success message shown
- Event added to "My Events" or "My RSVPs"
- Attendee count increased
- Email confirmation sent
- RSVP button changes to "Registered" or "Cancel RSVP"

**Success Criteria:** ✅ RSVP successful

---

#### Test 11.2: RSVP to Full Event

**Steps:**
1. Find event at full capacity (attendees = capacity)
2. Try to RSVP

**Expected Results:**
- RSVP button disabled or shows "Full"
- Or added to waitlist
- Message: "Event is full" or "Added to waitlist"

**Success Criteria:** ✅ Full event handling works

---

#### Test 11.3: Cancel RSVP

**Steps:**
1. On registered event, click "Cancel RSVP"
2. Confirm cancellation

**Expected Results:**
- RSVP cancelled
- Removed from attendee list
- Capacity freed up
- Can RSVP again
- Email notification sent

**Success Criteria:** ✅ RSVP cancelled successfully

---

### Test 12: Event Check-In

#### Test 12.1: QR Code Check-In (Mobile)

**Steps:**
1. Sign in as student on mobile device
2. RSVP to an event
3. Navigate to event details
4. Click "Scan QR Code" or access scanner
5. Scan the event's QR code (from organizer's view or event details)

**Expected Results:**
- QR code recognized
- Check-in confirmation shown
- Points awarded (e.g., 10 points)
- Notification: "You earned 10 points for checking in"
- Check-in timestamp recorded
- Total points updated
- Cannot check in twice to same event

**Success Criteria:** ✅ QR check-in works, points awarded

---

#### Test 12.2: Manual Check-In (Alternative)

**Steps:**
1. On event details page (after RSVP)
2. Click "Check In" button (if available)
3. Confirm check-in

**Expected Results:**
- Same as QR code check-in
- Points awarded
- Notification created

**Success Criteria:** ✅ Manual check-in works

---

#### Test 12.3: Duplicate Check-In Prevention

**Steps:**
1. Try to check in again to same event

**Expected Results:**
- Error: "User already checked in"
- No additional points awarded
- Check-in blocked

**Success Criteria:** ✅ Duplicate check-in prevented

---

#### Test 12.4: Check-In Without RSVP

**Steps:**
1. Sign in as different student who didn't RSVP
2. Try to check in to event

**Expected Results:**
- Error: "User is not registered for this event"
- Check-in blocked
- No points awarded

**Success Criteria:** ✅ Check-in requires RSVP

---

## Gamification Features Testing

### Test 13: Points System

#### Test 13.1: View Points Balance

**Steps:**
1. Sign in as student
2. Navigate to profile or dashboard

**Expected Results:**
- Current points balance displayed
- Shows total events attended
- Points history visible

**Success Criteria:** ✅ Points balance visible

---

#### Test 13.2: Earn Points via Check-In

**Steps:**
1. Check in to an event worth 10 points
2. Check points balance

**Expected Results:**
- Points increased by 10
- Events attended count increased by 1
- Notification received

**Success Criteria:** ✅ Points earned correctly

---

### Test 14: Leaderboard

#### Test 14.1: View Leaderboard

**Steps:**
1. Navigate to "Leaderboard" page
2. Observe rankings

**Expected Results:**
- Top 10 students displayed
- Ranked by total points (descending)
- Shows: Rank, name, points, events attended
- Own rank highlighted or shown separately
- Real-time or cached (updates within 10 min)

**Success Criteria:** ✅ Leaderboard displays correctly

---

#### Test 14.2: Leaderboard Updates

**Steps:**
1. Check current rank
2. Check in to event (earn points)
3. Refresh leaderboard

**Expected Results:**
- Rank updated (may take up to 10 min due to caching)
- Points reflect new total
- Position may change

**Success Criteria:** ✅ Leaderboard updates after points change

---

### Test 15: Rewards System

#### Test 15.1: View Rewards Catalog

**Steps:**
1. Navigate to "Rewards" page
2. Browse available rewards

**Expected Results:**
- All rewards displayed
- Shows: Name, image, cost, description
- Indicates if affordable (enough points)
- Can filter/sort rewards

**Success Criteria:** ✅ Rewards catalog visible

---

#### Test 15.2: Redeem Reward

**Steps:**
1. Ensure sufficient points (e.g., 50 points)
2. Find reward costing ≤ available points
3. Click "Redeem"
4. Confirm redemption

**Expected Results:**
- Redemption successful
- Points deducted immediately
- Notification: "Reward redeemed successfully"
- Remaining points shown
- Redemption recorded in history
- Confirmation email sent (optional)

**Success Criteria:** ✅ Reward redeemed, points deducted

---

#### Test 15.3: Insufficient Points

**Steps:**
1. Try to redeem reward costing more than available points

**Expected Results:**
- Error: "Insufficient points"
- Redemption blocked
- No points deducted

**Success Criteria:** ✅ Insufficient points prevented

---

#### Test 15.4: Concurrent Redemption Prevention

**Purpose:** Test race condition fix

**Steps:**
1. Open two browser tabs/windows
2. Sign in with same account (ensure exactly enough points for reward)
3. In both tabs, click "Redeem" simultaneously
4. Observe results

**Expected Results:**
- Only one redemption succeeds
- Second request fails with: "Insufficient points" or "Duplicate redemption detected"
- Points only deducted once
- No negative points balance

**Success Criteria:** ✅ Race condition prevented

---

### Test 16: Notifications

#### Test 16.1: View Notifications

**Steps:**
1. Click notification bell icon
2. View notification panel

**Expected Results:**
- All notifications displayed
- Shows: Type icon, title, message, timestamp
- Unread notifications highlighted
- Badge shows unread count

**Success Criteria:** ✅ Notifications visible

---

#### Test 16.2: Notification Types

**Create notifications by:**
1. RSVP to event → Notification: "RSVP confirmed for [Event]"
2. Check in to event → Notification: "You earned X points..."
3. Redeem reward → Notification: "Reward redeemed successfully"
4. Event cancelled (organizer) → Notification to attendees

**Expected Results:**
- All notification types received
- Correct icons and messages

**Success Criteria:** ✅ All notification types work

---

#### Test 16.3: Mark as Read

**Steps:**
1. Click on notification
2. Observe status change

**Expected Results:**
- Notification marked as read
- Styling changes (e.g., background color)
- Unread count decreases

**Success Criteria:** ✅ Mark as read works

---

#### Test 16.4: Clear All Notifications

**Steps:**
1. Click "Clear All" or "Mark All as Read"

**Expected Results:**
- All notifications marked as read
- Or deleted (based on implementation)
- Badge count resets to 0

**Success Criteria:** ✅ Clear all works

---

## Admin Dashboard Testing

### Test 17: Admin Access

> **Note:** Both admin and organizer roles have full access to the admin dashboard and all admin features. In the current setup (single organization, single organizer), the organizer acts as both event creator and administrator.

#### Test 17.1: Admin/Organizer Sign In

**Steps:**
1. Sign in with organizer or admin credentials
2. Navigate to Admin Dashboard

**Expected Results:**
- Dashboard loads successfully
- Shows admin features (users, events, rewards, stats)
- Navigation includes "Admin" link

**Success Criteria:** ✅ Admin access granted to organizer/admin roles

---

### Test 18: Admin Dashboard Features

#### Test 18.1: Statistics Overview

**Steps:**
1. View admin dashboard home
2. Observe statistics cards

**Expected Results:**
- Shows: Total users, events, RSVPs, check-ins
- Displays charts/graphs
- Real-time or recent data

**Success Criteria:** ✅ Statistics displayed

---

#### Test 18.2: User Management

**Steps:**
1. Navigate to "Users" section
2. View user list
3. Search for specific user
4. View user details
5. (Optional) Edit user role or status

**Expected Results:**
- All users listed
- Search works
- Can view/edit user details
- Role changes apply immediately

**Success Criteria:** ✅ User management functional

---

#### Test 18.3: Event Management

**Steps:**
1. Navigate to "Events" section in admin
2. View all events (including inactive)
3. Approve/reject pending events (if approval workflow exists)
4. View event analytics

**Expected Results:**
- All events visible (active, cancelled, past)
- Can manage event status
- Analytics shown (attendee count, check-ins, etc.)

**Success Criteria:** ✅ Event management works

---

#### Test 18.4: Rewards Management

**Steps:**
1. Navigate to "Rewards" section
2. Click "Create Reward"
3. Fill form:
   - Name: `Free Coffee`
   - Cost: `20`
   - Description: `One free coffee at campus café`
   - Upload image
4. Submit

**Expected Results:**
- Reward created
- Appears in rewards catalog
- Students can redeem it

**Success Criteria:** ✅ Reward creation works

---

#### Test 18.5: Edit/Delete Reward

**Steps:**
1. Edit created reward (change cost to 25)
2. Delete a test reward

**Expected Results:**
- Changes saved
- Deleted reward removed from catalog
- Students can't redeem deleted rewards

**Success Criteria:** ✅ Edit/delete works

---

## Performance Testing

### Test 19: Response Time

#### Test 19.1: API Response Times

**Steps:**
```bash
# Test events endpoint
time curl http://localhost:4000/api/events

# Test leaderboard endpoint
time curl http://localhost:4000/api/leaderboard

# Test rewards endpoint
time curl http://localhost:4000/api/rewards
```

**Expected Results:**
- All requests complete in < 500ms
- Average response time < 200ms

**Success Criteria:** ✅ Response times acceptable

---

#### Test 19.2: Database Query Performance

**Steps:**
1. Check slow query logs
2. Run EXPLAIN on complex queries

```sql
EXPLAIN ANALYZE
SELECT * FROM users
ORDER BY total_points DESC
LIMIT 10;
```

**Expected Results:**
- Queries use indexes (check EXPLAIN output)
- No sequential scans on large tables
- Query time < 100ms

**Success Criteria:** ✅ Queries optimized

---

### Test 20: Load Testing

#### Test 20.1: Concurrent Users

**Purpose:** Test system under load

**Steps:**
1. Install Artillery (if not installed):
   ```bash
   npm install -g artillery
   ```

2. Create load test config (`loadtest.yml`):
   ```yaml
   config:
     target: "http://localhost:4000"
     phases:
       - duration: 60
         arrivalRate: 10
         name: "Warm up"
       - duration: 120
         arrivalRate: 50
         name: "Peak load"
       - duration: 60
         arrivalRate: 10
         name: "Cool down"
   scenarios:
     - flow:
         - get:
             url: "/api/events"
         - get:
             url: "/api/leaderboard"
         - get:
             url: "/api/rewards"
   ```

3. Run load test:
   ```bash
   artillery run loadtest.yml
   ```

**Expected Results:**
- All requests succeed (< 1% error rate)
- Response times remain < 1000ms
- No memory leaks
- No database connection errors

**Success Criteria:** ✅ Handles 50 concurrent users

---

### Test 21: Caching

#### Test 21.1: Response Caching (Production)

**Purpose:** Verify caching improves performance

**Steps:**
1. Deploy to production
2. Make request to `/api/events`
3. Note response time
4. Make same request again immediately
5. Note response time

**Expected Results:**
- First request: Normal time (e.g., 200ms)
- Second request: Faster (e.g., 10ms) - served from cache
- Response headers include cache info

**Success Criteria:** ✅ Caching reduces response time

---

## Mobile & Cross-Browser Testing

### Test 22: Mobile Responsiveness

#### Test 22.1: Mobile Layout

**Steps:**
1. Open frontend on mobile device or emulator
2. Test all pages:
   - Home
   - Events list
   - Event details
   - Profile
   - Leaderboard
   - Rewards

**Expected Results:**
- All pages render correctly on mobile
- No horizontal scrolling
- Touch targets large enough (min 44x44px)
- Text readable without zooming
- Images scale properly

**Success Criteria:** ✅ Mobile-friendly layout

---

#### Test 22.2: QR Scanner (Mobile)

**Steps:**
1. Access QR scanner feature on mobile
2. Scan event QR code

**Expected Results:**
- Camera permission requested
- QR code detected quickly
- Check-in processed
- Feedback shown immediately

**Success Criteria:** ✅ QR scanner works on mobile

---

### Test 23: Cross-Browser Testing

#### Test 23.1: Browser Compatibility

**Test on:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

**Steps:**
1. Perform core user journey on each browser:
   - Sign up
   - Browse events
   - RSVP
   - Check in
   - View leaderboard
   - Redeem reward

**Expected Results:**
- All features work on all browsers
- UI renders correctly
- No console errors
- Performance acceptable

**Success Criteria:** ✅ Works on all major browsers

---

## Data Integrity Testing

### Test 24: Race Conditions

#### Test 24.1: Concurrent Reward Redemption

**Purpose:** Verify transaction prevents double deduction

**Setup:**
- User has exactly 50 points
- Reward costs 50 points

**Steps:**
1. Open two browser tabs with same user
2. In both tabs, navigate to rewards
3. Click "Redeem" simultaneously in both tabs

**Expected Results:**
- Only one redemption succeeds
- Other fails with error
- Points balance: 0 (not negative)
- Only one redemption record in database

**Success Criteria:** ✅ No double deduction

**Verification:**
```sql
SELECT total_points FROM users WHERE id = 'user-id';
-- Should be 0, not -50

SELECT COUNT(*) FROM redemptions WHERE user_id = 'user-id' AND reward_id = 'reward-id';
-- Should be 1, not 2
```

---

#### Test 24.2: Concurrent Check-Ins

**Setup:**
- User has RSVP'd to event
- Event awards 10 points

**Steps:**
1. Open two tabs with same user
2. Scan QR code or click check-in simultaneously

**Expected Results:**
- Only one check-in succeeds
- Other fails: "User already checked in"
- Points awarded once (e.g., 10 points, not 20)
- Only one check-in timestamp

**Success Criteria:** ✅ No duplicate check-ins

**Verification:**
```sql
SELECT checked_in_at FROM event_attendees
WHERE user_id = 'user-id' AND event_id = 'event-id';
-- Should return 1 row

SELECT total_points FROM users WHERE id = 'user-id';
-- Should be (previous + 10), not (previous + 20)
```

---

### Test 25: Database Constraints

#### Test 25.1: Negative Points Prevention

**Steps:**
1. Set user points to 10 via database
2. Try to redeem reward costing 50

**Expected Results:**
- Redemption fails: "Insufficient points"
- Database constraint prevents negative: `CHECK (total_points >= 0)`

**Verification:**
```sql
-- This should fail
UPDATE users SET total_points = -50 WHERE id = 'user-id';
-- Error: new row violates check constraint "positive_points"
```

**Success Criteria:** ✅ Negative points prevented

---

#### Test 25.2: Unique Check-In Constraint

**Steps:**
1. Manually try to insert duplicate check-in

**Verification:**
```sql
-- This should fail if user already checked in
INSERT INTO event_attendees (user_id, event_id, checked_in_at, status)
VALUES ('user-id', 'event-id', NOW(), 'confirmed');
-- Error: violates unique constraint "idx_unique_checkin"
```

**Success Criteria:** ✅ Constraint prevents duplicates

---

## Error Handling Testing

### Test 26: Network Errors

#### Test 26.1: Offline Handling

**Steps:**
1. Disconnect internet
2. Try to load events page
3. Try to submit form

**Expected Results:**
- Error message shown: "Unable to connect to server"
- No app crash
- Graceful fallback UI

**Success Criteria:** ✅ Offline error handled

---

#### Test 26.2: Slow Network

**Steps:**
1. Throttle network to "Slow 3G" in DevTools
2. Navigate pages
3. Submit forms

**Expected Results:**
- Loading indicators shown
- No timeouts (or appropriate timeout handling)
- User can still interact with loaded content

**Success Criteria:** ✅ Slow network handled

---

### Test 27: Server Errors

#### Test 27.1: 500 Internal Server Error

**Steps:**
1. Cause server error (e.g., stop database)
2. Try to load events

**Expected Results:**
- User sees error message: "Something went wrong"
- Error logged to Sentry (if configured)
- No sensitive error details exposed

**Success Criteria:** ✅ Server error handled gracefully

---

#### Test 27.2: 404 Not Found

**Steps:**
1. Navigate to non-existent event: `/events/invalid-id`

**Expected Results:**
- 404 page shown
- Message: "Event not found"
- Link to return to events list

**Success Criteria:** ✅ 404 handled

---

## End-to-End User Journeys

### Test 28: Complete Student Journey

**Scenario:** New student discovers, RSVPs, attends event, earns points, redeems reward

**Steps:**

1. **Sign Up**
   - Navigate to homepage
   - Click "Sign Up"
   - Fill form: `newstudent@test.com`, password `Student123!`
   - Submit → Should see dashboard

2. **Browse Events**
   - Click "Events" in navigation
   - See list of active events
   - Filter by category "Technical"
   - Find interesting event

3. **RSVP to Event**
   - Click on event card
   - View event details
   - Click "RSVP" button
   - See confirmation message
   - Receive email confirmation

4. **Check Profile**
   - Navigate to Profile
   - See points balance: 0
   - See events attended: 0

5. **Attend Event (Check-In)**
   - On mobile, open scanner
   - Scan event QR code
   - See success: "Check-in successful! You earned 10 points"
   - See notification

6. **View Updated Points**
   - Check profile
   - Points balance: 10
   - Events attended: 1

7. **Check Leaderboard**
   - Navigate to Leaderboard
   - Find own position
   - See ranking

8. **Browse Rewards**
   - Navigate to Rewards
   - See affordable reward (cost ≤ 10 points)
   - Click "Redeem"
   - Confirm redemption

9. **View Redemption**
   - See success message
   - Points deducted (balance now 0)
   - Check notifications
   - See redemption confirmation

**Expected Results:** ✅ Entire journey completes without errors

**Time:** ~5-10 minutes

---

### Test 29: Complete Organizer Journey

**Scenario:** Organizer creates event, RSVPs to own event, manages attendees, uses admin features, cancels event

> **Note:** Organizers have full admin privileges. They can create events, RSVP to their own events, manage users, create rewards, and perform all admin functions.

**Steps:**

1. **Sign Up as Organizer**
   - Sign up with role "Organizer"
   - Organization: "Computer Science Club"

2. **Create Event**
   - Navigate to "Create Event"
   - Fill all details (title, description, date, location, capacity, points)
   - Upload image
   - Submit

3. **RSVP to Own Event**
   - Navigate to the created event's detail page
   - Click "RSVP" button
   - Confirm RSVP succeeds
   - See self in attendee list

4. **View Created Event**
   - See event in "My Events"
   - See QR code generated
   - Note event ID

5. **Manage Event**
   - View attendee list (should include self)
   - Share QR code

6. **Monitor RSVPs**
   - (As student in another tab, RSVP to this event)
   - Refresh organizer view
   - See attendee in list

7. **Access Admin Dashboard**
   - Navigate to Admin Dashboard
   - View system statistics (total users, events, RSVPs)
   - Verify full admin access

8. **Admin: Manage Users**
   - Navigate to Users section
   - View user list, search for users
   - Change a user's role

9. **Admin: Create Reward**
   - Navigate to Rewards section
   - Create a new reward (name, cost, description)
   - Verify it appears in the rewards catalog

10. **Admin: Approve/Reject Events**
    - View pending events
    - Approve or reject an event

11. **Update Event**
    - Edit event details
    - Change description
    - Save changes

12. **Cancel Event**
    - Click "Cancel Event"
    - Enter reason: "Venue unavailable"
    - Confirm

13. **Verify Cancellation**
    - Event shows "Cancelled" status
    - Attendees notified via email
    - Event still visible but marked cancelled

**Expected Results:** ✅ Organizer can manage full event lifecycle and perform all admin functions

**Time:** ~15-20 minutes

---

### Test 30: Complete Admin Journey

**Scenario:** Admin (or organizer) manages users, creates rewards, monitors system

> **Note:** This journey can be performed by either an admin or organizer account, as both roles have identical admin privileges.

**Steps:**

1. **Sign In as Admin or Organizer**
   - Use admin or organizer credentials

2. **View Dashboard**
   - See system statistics
   - Total users, events, RSVPs, check-ins
   - View charts

3. **Manage Users**
   - Navigate to Users section
   - Search for user
   - View user details
   - (Optional) Change user role

4. **Create Reward**
   - Navigate to Rewards
   - Click "Create Reward"
   - Fill details: Name, cost, description, image
   - Submit
   - Verify appears in catalog

5. **Manage Events**
   - View all events
   - See pending approvals (if applicable)
   - Approve/reject events

6. **View Analytics**
   - Check engagement metrics
   - Most popular events
   - Top students on leaderboard
   - Redemption statistics

**Expected Results:** ✅ Admin/organizer can manage entire system

**Time:** ~10 minutes

---

## Test Data Cleanup

### After Testing

```sql
-- Clean test data (CAUTION: Use only on test database!)
DELETE FROM redemptions WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com');
DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com');
DELETE FROM event_attendees WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com');
DELETE FROM events WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com');
DELETE FROM users WHERE email LIKE '%@test.com';
```

---

## Test Results Template

### Test Execution Summary

**Date:** _______________________
**Tester:** _____________________
**Environment:** Local / Staging / Production

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1.1 | Auth Rate Limiting | ✅ / ❌ | |
| 1.2 | RSVP Rate Limiting | ✅ / ❌ | |
| 2.1 | CORS Unauthorized | ✅ / ❌ | |
| 2.2 | CORS Authorized | ✅ / ❌ | |
| 3.1 | Invalid Email | ✅ / ❌ | |
| 3.2 | Weak Password | ✅ / ❌ | |
| 3.3 | XSS Prevention | ✅ / ❌ | |
| 3.4 | SQL Injection | ✅ / ❌ | |
| ... | ... | ... | |

**Pass Rate:** ___ / ___ (___%)

**Critical Issues Found:** ___________________

**Recommendation:** ✅ Ready for Production / ❌ Not Ready

---

## Automated Testing (Future)

### Recommended Test Frameworks

**Backend:**
- Jest/Mocha for unit tests
- Supertest for API testing
- Artillery for load testing

**Frontend:**
- Jest + React Testing Library
- Cypress for E2E testing
- Playwright for cross-browser testing

### Sample Automated Test

```javascript
// Example API test with Supertest
import request from 'supertest';
import app from '../src/index.js';

describe('Auth API', () => {
  it('should block after 5 failed login attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/signin')
        .send({ email: 'test@test.com', password: 'wrong' })
        .expect(401);
    }

    const res = await request(app)
      .post('/api/auth/signin')
      .send({ email: 'test@test.com', password: 'wrong' })
      .expect(429);

    expect(res.body.error).toBe('Too many attempts, please try again later');
  });
});
```

---

## Conclusion

This comprehensive testing guide covers:
- ✅ 30+ detailed test scenarios
- ✅ Security, functionality, performance testing
- ✅ Race condition and data integrity testing
- ✅ Complete user journeys for all roles
- ✅ Mobile and cross-browser testing

**Estimated Testing Time:** 4-6 hours for complete manual testing

**Next Steps:**
1. Execute all tests in sequence
2. Document results in test results template
3. Fix any issues found
4. Re-test failed scenarios
5. Achieve 100% pass rate before production deployment

**Questions or Issues?** Refer to SECURITY.md and DEPLOYMENT.md for additional guidance.
