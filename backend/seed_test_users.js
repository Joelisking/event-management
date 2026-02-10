import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load env specific to where script is run
// Assuming run from backend/ dir or similar, or adjust path
// Better to just rely on process.env if loaded, but here we load explicitly
// Since db.js loads it, we can import from there, but imports might be tricky with paths
// Let's just use pg directly to avoid module path issues

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://joel:joel@localhost:5432/event_management',
});

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Pass123$1',
    role: 'admin',
  },
  {
    name: 'Organizer User',
    email: 'organizer@example.com',
    password: 'Pass123$1',
    role: 'organizer',
    organization_name: 'Test Org',
  },
  {
    name: 'Student One',
    email: 'student1@example.com',
    password: 'Pass123$1',
    role: 'student',
  },
  {
    name: 'Student Two',
    email: 'student2@example.com',
    password: 'Pass123$1',
    role: 'student',
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding test users...');

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      const res = await client.query(
        `INSERT INTO users (name, email, "passwordHash", role, organization_name, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (email) DO UPDATE 
         SET "passwordHash" = $3, role = $4, organization_name = $5
         RETURNING id, email, role`,
        [
          user.name,
          user.email,
          hashedPassword,
          user.role,
          user.organization_name || null,
        ]
      );
      console.log(
        `Seeded user: ${res.rows[0].email} (${res.rows[0].role})`
      );
    }

    console.log('Done!');
  } catch (err) {
    console.error('Error seeding users:', err);
  } finally {
    client.release();
    await pool.end();
    process.exit();
  }
}

seed();
