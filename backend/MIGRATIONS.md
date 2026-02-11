# Automatic Database Migrations on Deployment

## Overview

The backend is now configured to automatically run all pending database migrations when deployed to Render (or any other hosting platform).

## How It Works

### Migration Runner Script

[run-migrations.js](file:///Users/joel/Documents/event-management/backend/scripts/run-migrations.js)

This script:

1. **Connects to the database** using `DATABASE_URL` environment variable
2. **Creates a tracking table** (`schema_migrations`) to record executed migrations
3. **Runs pending migrations** in the correct order
4. **Skips already-executed migrations** to ensure idempotency
5. **Handles errors gracefully** and provides clear logging

### Migration Tracking

The script creates a `schema_migrations` table to track which migrations have been executed:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

This ensures migrations are only run once, even if the deployment process runs multiple times.

### Migration Order

Migrations are executed in this order:

1. `complete_schema_with_updates.sql` - Base schema
2. `03_add_features.sql` - Additional features
3. `04_production_constraints.sql` - Production constraints
4. `05_performance_indexes.sql` - Performance indexes
5. `add_event_status.sql` - Event status fields
6. `add_event_time_slots.sql` - Event time slots
7. `add_organization_name.sql` - Organization name field
8. `add_user_categories.sql` - **NEW** User categories and location fields

## Deployment Configuration

### Render Settings

**Build Command:**

```bash
npm install
```

**Start Command:**

```bash
npm run start:prod
```

The `start:prod` script now runs migrations before starting the server:

```json
"start:prod": "node scripts/run-migrations.js && NODE_ENV=production node src/index.js"
```

### Environment Variables Required

Make sure these are set in your Render environment:

- `DATABASE_URL` - PostgreSQL connection string (required)
- `NODE_ENV` - Set to `production`
- `JWT_SECRET` - Your JWT secret
- `CLOUDINARY_CLOUD_NAME` - Cloudinary credentials
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `EMAIL_HOST` - Email configuration
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `FRONTEND_URL` - Your frontend URL

## Manual Migration Commands

You can also run migrations manually if needed:

```bash
# Run all pending migrations
npm run migrate

# Run specific migrations (manual method)
npm run migrate:manual
npm run migrate:features
npm run migrate:constraints
npm run migrate:indexes
```

## Testing Locally

Test the migration script locally before deploying:

```bash
# Make sure DATABASE_URL is set in your .env file
npm run migrate
```

Expected output:

```
🔄 Connecting to database...
✓ Connected to database
✓ Migrations tracking table ready
📋 Found X previously executed migrations

🚀 Running pending migrations...

  ⏭️  Skipping (already executed): complete_schema_with_updates.sql
  ⏭️  Skipping (already executed): 03_add_features.sql
  ...
  Running: add_user_categories.sql
  ✓ Completed: add_user_categories.sql

✅ Migration complete! Executed 1 new migration(s)
```

## Deployment Process

When you deploy to Render:

1. **Build phase:** `npm install` installs dependencies
2. **Start phase:**
   - `node scripts/run-migrations.js` runs pending migrations
   - If migrations succeed → Server starts with `node src/index.js`
   - If migrations fail → Deployment fails with error message

## Adding New Migrations

To add a new migration in the future:

1. Create a new `.sql` file in `backend/db/migrations/`
2. Add the filename to the `migrationFiles` array in `run-migrations.js`
3. Deploy - the migration will run automatically

Example:

```javascript
const migrationFiles = [
  // ... existing migrations ...
  'migrations/add_user_categories.sql',
  'migrations/your_new_migration.sql', // Add here
];
```

## Rollback Strategy

If a migration fails in production:

1. **Fix the migration SQL** in your codebase
2. **Manually remove the failed migration** from `schema_migrations` table:
   ```sql
   DELETE FROM schema_migrations WHERE filename = 'failed_migration.sql';
   ```
3. **Redeploy** - the migration will run again with the fix

## Benefits

✅ **Automatic** - No manual intervention needed on deployment  
✅ **Idempotent** - Safe to run multiple times  
✅ **Tracked** - Know exactly which migrations have run  
✅ **Ordered** - Migrations always run in the correct sequence  
✅ **Error handling** - Clear error messages if something goes wrong  
✅ **Production-ready** - Handles SSL connections for hosted databases

## Current Migration Status

The following migration was just added and will run on next deployment:

- ✅ `add_user_categories.sql` - Adds user category system with location fields for international users
