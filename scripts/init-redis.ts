// scripts/init-redis.ts
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
  console.log('🚀 Initializing Redis...');
  
  const ADMIN_GOOGLE_EMAIL = 'shukla.mayank247@gmail.com'; // ✅ CHANGE THIS
  
  // Create default organization
  const orgId = 'hope-energy';
  await redis.set(`org:${orgId}:info`, {
    id: orgId,
    name: 'Hope Energy',
    googleEmail: ADMIN_GOOGLE_EMAIL,
    sheetId: '',
    createdAt: new Date().toISOString()
  });

  // Create a test employee user (optional)
  const employeePassword = await bcrypt.hash('employee123', 10);
  await redis.set(`user:employee@hopeenergy.com:info`, {
    email: 'employee@hopeenergy.com',
    name: 'Test Employee',
    passwordHash: employeePassword,
    role: 'editor',
    organizationId: orgId,
    isActive: true,
    createdAt: new Date().toISOString()
  });
  
  await redis.sadd(`org:${orgId}:users`, 'employee@hopeenergy.com');

  // Set default permissions (same as before)
  await redis.set('role:admin:permissions', {
    enquiries: { view: true, create: true, edit: true, delete: true },
    surveys: { view: true, create: true, edit: true, delete: true },
    payments: { view: true, create: true, edit: true, delete: true },
    installation: { view: true, create: true, edit: true, delete: true },
    users: { view: true, create: true, edit: true, delete: true }
  });

  await redis.set('role:manager:permissions', {
    enquiries: { view: true, create: true, edit: true, delete: true },
    surveys: { view: true, create: true, edit: true, delete: true },
    payments: { view: true, create: true, edit: false, delete: false },
    installation: { view: true, create: true, edit: true, delete: true },
    users: { view: true, create: false, edit: false, delete: false }
  });

  await redis.set('role:editor:permissions', {
    enquiries: { view: true, create: true, edit: true, delete: false },
    surveys: { view: true, create: true, edit: true, delete: false },
    payments: { view: true, create: false, edit: false, delete: false },
    installation: { view: true, create: true, edit: true, delete: false },
    users: { view: false, create: false, edit: false, delete: false }
  });

  await redis.set('role:viewer:permissions', {
    enquiries: { view: true, create: false, edit: false, delete: false },
    surveys: { view: true, create: false, edit: false, delete: false },
    payments: { view: true, create: false, edit: false, delete: false },
    installation: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false }
  });

  console.log('✅ Redis initialized successfully!');
  console.log('');
  console.log('👤 Admin (Google OAuth):');
  console.log(`   Email: ${ADMIN_GOOGLE_EMAIL}`);
  console.log('   Login via: Sign in with Google');
  console.log('');
  console.log('👤 Employee (Email/Password):');
  console.log('   Email: employee@hopeenergy.com');
  console.log('   Password: employee123');
  console.log('');
}

initRedis()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
