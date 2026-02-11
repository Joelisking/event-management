#!/usr/bin/env node

/**
 * Migration Runner Script
 * Automatically runs all pending database migrations in order
 * This script is designed to run on deployment (e.g., Render, Railway, etc.)
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Migration tracking table
const MIGRATIONS_TABLE = 'schema_migrations';

async function createMigrationsTable(client) {
  const query = `
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await client.query(query);
  console.log('✓ Migrations tracking table ready');
}

async function getExecutedMigrations(client) {
  const result = await client.query(
    `SELECT filename FROM ${MIGRATIONS_TABLE} ORDER BY id`
  );
  return result.rows.map((row) => row.filename);
}

async function recordMigration(client, filename) {
  await client.query(
    `INSERT INTO ${MIGRATIONS_TABLE} (filename) VALUES ($1)`,
    [filename]
  );
}

async function executeSqlFile(client, filepath, filename) {
  const fs = await import('fs/promises');
  const sql = await fs.readFile(filepath, 'utf-8');

  console.log(`  Running: ${filename}`);
  await client.query(sql);
  await recordMigration(client, filename);
  console.log(`  ✓ Completed: ${filename}`);
}

async function runMigrations() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✓ Connected to database');

    // Create migrations tracking table
    await createMigrationsTable(client);

    // Get list of executed migrations
    const executedMigrations = await getExecutedMigrations(client);
    console.log(
      `📋 Found ${executedMigrations.length} previously executed migrations`
    );

    // Define migration files in order
    const migrationFiles = [
      'complete_schema_with_updates.sql',
      'migrations/03_add_features.sql',
      'migrations/04_production_constraints.sql',
      'migrations/05_performance_indexes.sql',
      'migrations/add_event_status.sql',
      'migrations/add_event_time_slots.sql',
      'migrations/add_organization_name.sql',
      'migrations/add_user_categories.sql',
    ];

    // Run pending migrations
    let pendingCount = 0;
    console.log('\n🚀 Running pending migrations...\n');

    for (const migrationFile of migrationFiles) {
      const filename = migrationFile.split('/').pop();

      if (executedMigrations.includes(filename)) {
        console.log(`  ⏭️  Skipping (already executed): ${filename}`);
        continue;
      }

      const filepath = join(__dirname, '..', 'db', migrationFile);

      try {
        await executeSqlFile(client, filepath, filename);
        pendingCount++;
      } catch (error) {
        // Check if error is due to already existing objects (idempotent migrations)
        if (error.message.includes('already exists')) {
          console.log(
            `  ⚠️  Warning: ${filename} - Some objects already exist (continuing)`
          );
          await recordMigration(client, filename);
        } else if (
          error.message.includes('does not exist') ||
          error.code === '42703' ||
          error.code === '42P01'
        ) {
          // Column or table doesn't exist - skip this migration
          console.log(
            `  ⏭️  Skipping: ${filename} - References non-existent objects`
          );
          await recordMigration(client, filename);
        } else {
          throw error;
        }
      }
    }

    console.log(
      `\n✅ Migration complete! Executed ${pendingCount} new migration(s)`
    );
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migrations
runMigrations();
