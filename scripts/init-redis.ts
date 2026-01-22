// scripts/init-redis.ts
import { config } from 'dotenv';
import { resolve } from 'path';
import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Initialize Redis with loaded env vars
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function initRedis() {
  console.log('🚀 Initializing Redis...');
  console.log('📍 Redis URL:', process.env.UPSTASH_REDIS_REST_URL);
  
  // Create default organization
  const orgId = 'hope-energy';
  await redis.set(`org:${orgId}:info`, {
    id: orgId,
    name: 'Hope Energy',
    googleEmail: 'admin@hopeenergy.com',
    sheetId: '', // Set later when admin connects sheet
    createdAt: new Date().toISOString()
  });

  // Create default admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await redis.set(`user:admin@hopeenergy.com:info`, {
    email: 'admin@hopeenergy.com',
    name: 'Admin User',
    passwordHash: adminPassword,
    role: 'admin',
    organizationId: orgId,
    isActive: true,
    createdAt: new Date().toISOString()
  });
  
  await redis.sadd(`org:${orgId}:users`, 'admin@hopeenergy.com');

  // Set default permissions
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
  console.log('📧 Admin Email: admin@hopeenergy.com');
  console.log('🔑 Admin Password: admin123');
  console.log('⚠️  Please change the password after first login!');
  console.log('');
}

initRedis()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error initializing Redis:', error);
    process.exit(1);
  });
