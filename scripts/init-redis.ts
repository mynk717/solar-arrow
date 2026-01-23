import { config } from 'dotenv';
import { resolve } from 'path';
import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';

config({ path: resolve(process.cwd(), '.env.local') });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function initRedis() {
  console.log('Initializing Redis...');

  const ADMIN_GOOGLE_EMAIL = 'shukla.mayank247@gmail.com'; // Your Gmail
  const ADMIN_PASSWORD = 'admin123'; // Admin password for email/password login

  // Create default organization
  const orgId = 'hope-energy';
  await redis.set(`org:${orgId}:info`, {
    id: orgId,
    name: 'Hope Energy',
    googleEmail: ADMIN_GOOGLE_EMAIL,
    sheetId: '',
    createdAt: new Date().toISOString(),
  });

  // Create admin user with password (in addition to Google OAuth)
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await redis.set(`user:${ADMIN_GOOGLE_EMAIL}:info`, {
    email: ADMIN_GOOGLE_EMAIL,
    name: 'Admin User',
    passwordHash: adminPasswordHash,
    role: 'admin',
    organizationId: orgId,
    isActive: true,
    createdAt: new Date().toISOString(),
  });
  await redis.sadd(`org:${orgId}:users`, ADMIN_GOOGLE_EMAIL);

  // Create a test employee user
  const employeePassword = await bcrypt.hash('employee123', 10);
  await redis.set(`user:employee@hopeenergy.com:info`, {
    email: 'employee@hopeenergy.com',
    name: 'Test Employee',
    passwordHash: employeePassword,
    role: 'editor',
    organizationId: orgId,
    isActive: true,
    createdAt: new Date().toISOString(),
  });
  await redis.sadd(`org:${orgId}:users`, 'employee@hopeenergy.com');

  // Set permissions (same as before)
  await redis.set('role:admin:permissions', {
    enquiries: { view: true, create: true, edit: true, delete: true },
    surveys: { view: true, create: true, edit: true, delete: true },
    payments: { view: true, create: true, edit: true, delete: true },
    installation: { view: true, create: true, edit: true, delete: true },
    users: { view: true, create: true, edit: true, delete: true },
  });

  await redis.set('role:editor:permissions', {
    enquiries: { view: true, create: true, edit: true, delete: false },
    surveys: { view: true, create: true, edit: true, delete: false },
    payments: { view: true, create: false, edit: false, delete: false },
    installation: { view: true, create: true, edit: true, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
  });

  console.log('✅ Redis initialized successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('\n👤 Admin (Google OAuth):');
  console.log(`   Email: ${ADMIN_GOOGLE_EMAIL}`);
  console.log('   Method: Sign in with Google button');
  console.log('\n👤 Admin (Email/Password):');
  console.log(`   Email: ${ADMIN_GOOGLE_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log('\n👤 Employee (Email/Password):');
  console.log('   Email: employee@hopeenergy.com');
  console.log('   Password: employee123');
}

initRedis()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
