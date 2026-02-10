# Deployment Guide - Event Management Application

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Cloudinary account for image uploads
- Email service (Gmail with app password)
- Git repository
- Cloud platform accounts (Vercel for frontend, Railway/Render for backend)

## Environment Variables

### Backend (.env)

**CRITICAL: Never commit .env files to git!**

Create `.env` file in `/backend` directory with the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database_name

# JWT Secret (Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-64-byte-hex-string

# Server Configuration
PORT=4000
NODE_ENV=production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=https://your-app.vercel.app

# Optional: Sentry for error tracking
SENTRY_DSN=your-sentry-dsn

# Optional: Logging
LOG_LEVEL=info
```

### Frontend (.env.production)

Create `.env.production` file in `/frontend` directory:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

## Backend Deployment (Railway)

### Option 1: Railway CLI

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize project:
   ```bash
   cd backend
   railway init
   ```

4. Add PostgreSQL database:
   ```bash
   railway add
   # Select PostgreSQL
   ```

5. Set environment variables:
   ```bash
   railway variables set JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
   railway variables set NODE_ENV=production
   railway variables set FRONTEND_URL=https://your-app.vercel.app
   # Add other variables from .env file
   ```

6. Deploy:
   ```bash
   railway up
   ```

### Option 2: Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repository
4. Add PostgreSQL plugin
5. Configure environment variables in dashboard
6. Deploy will happen automatically

### Database Migration

After deployment, run migrations:

```bash
# Connect to production database
railway run npm run migrate:all

# Or manually run each migration
railway run npm run migrate
railway run npm run migrate:features
railway run npm run migrate:constraints
railway run npm run migrate:indexes
```

## Backend Deployment (Render)

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Use the included `render.yaml` for automatic configuration
5. Or manually configure:
   - Build Command: `npm install`
   - Start Command: `npm run start:prod`
   - Environment: Node
6. Add environment variables in dashboard
7. Create PostgreSQL database (Starter plan)
8. Deploy

## Frontend Deployment (Vercel)

### Option 1: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy from frontend directory:
   ```bash
   cd frontend
   vercel
   ```

4. Set environment variable:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   # Enter your backend URL
   ```

5. Promote to production:
   ```bash
   vercel --prod
   ```

### Option 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Select `/frontend` as root directory
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your backend URL
5. Deploy

## Post-Deployment Checklist

### 1. Verify Backend Health

```bash
curl https://your-backend.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": 123.45,
  "database": "connected",
  "environment": "production"
}
```

### 2. Test HTTPS Redirect

```bash
curl -I http://your-backend.railway.app
# Should redirect to https://
```

### 3. Test CORS

```bash
curl -I -H "Origin: https://your-app.vercel.app" https://your-backend.railway.app/api/events
# Should include Access-Control-Allow-Origin header
```

### 4. Test Rate Limiting

```bash
# Make 6 rapid requests to auth endpoint
for i in {1..6}; do
  curl -X POST https://your-backend.railway.app/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}'
  echo ""
done
# 6th request should return 429 Too Many Requests
```

### 5. Verify Frontend Connection

1. Visit your frontend URL
2. Open browser DevTools > Network
3. Browse events page
4. Verify API calls go to production backend
5. Check for HTTPS lock icon in browser

### 6. Test User Journey

1. Sign up new account
2. Browse events
3. RSVP to event
4. Check-in via QR scanner
5. Verify points awarded
6. Redeem reward
7. Check notifications

## Monitoring

### Logs Access

**Railway:**
```bash
railway logs
```

**Render:**
- View logs in dashboard
- Or use Render CLI

**Vercel:**
```bash
vercel logs
```

### Health Monitoring

Set up monitoring service (e.g., UptimeRobot) to ping:
- Backend: `https://your-backend.railway.app/health`
- Frontend: `https://your-app.vercel.app`

### Error Tracking

If Sentry is configured:
1. Go to [sentry.io](https://sentry.io)
2. View errors in real-time
3. Get email alerts for critical errors

## Rollback Procedure

### Frontend Rollback (Vercel)

1. Go to Vercel dashboard
2. Deployments tab
3. Find previous successful deployment
4. Click "..." > "Promote to Production"

### Backend Rollback (Railway)

1. Go to Railway dashboard
2. Click on service
3. Deployments tab
4. Revert to previous deployment

### Database Rollback

**WARNING: Database migrations are forward-only. Do not rollback migrations.**

If data corruption occurs:
1. Restore from latest backup
2. Railway provides automatic backups
3. Or use PostgreSQL backup tools

## Security Reminders

- ✅ All environment variables set correctly
- ✅ HTTPS enabled on all endpoints
- ✅ CORS restricted to frontend domain
- ✅ Rate limiting active
- ✅ Database credentials regenerated
- ✅ JWT secret is 64+ bytes
- ✅ No .env files in git history
- ✅ Cloudinary keys regenerated
- ✅ Email password is app-specific

## Common Issues

### Issue: Database connection fails

**Solution:**
```bash
# Verify DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:pass@host:port/db

# Test connection
railway run psql $DATABASE_URL -c "SELECT NOW();"
```

### Issue: CORS errors in browser

**Solution:**
1. Verify FRONTEND_URL matches exactly (no trailing slash)
2. Check backend logs for CORS origin
3. Restart backend service

### Issue: Rate limiting too aggressive

**Solution:**
Adjust limits in `/backend/src/middleware/rate-limit.js`:
```javascript
max: 10, // Increase this number
windowMs: 15 * 60 * 1000, // Or increase time window
```

### Issue: Images not loading

**Solution:**
1. Check Cloudinary credentials
2. Verify images uploaded successfully
3. Check browser console for CORS errors
4. Ensure Cloudinary URLs in `next.config.js`

## Performance Optimization

### Database

- ✅ Indexes created via migration 05
- ✅ Connection pooling configured
- ✅ Query timeouts set

### Caching

- ✅ Response caching enabled in production
- Cache clearing:
  ```bash
  # Restart service to clear cache
  railway restart
  ```

### Frontend

- ✅ Next.js optimizations enabled
- ✅ Image optimization via Next Image
- ✅ Compression enabled

## Scaling

### Horizontal Scaling (Railway)

1. Go to service settings
2. Increase replicas
3. Railway handles load balancing automatically

### Database Scaling

1. Upgrade PostgreSQL plan
2. Consider read replicas for high traffic
3. Implement Redis caching if needed

## Support

For deployment issues:
- Railway: [railway.app/docs](https://railway.app/docs)
- Render: [render.com/docs](https://render.com/docs)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
