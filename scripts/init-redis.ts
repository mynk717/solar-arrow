// scripts/init-redis.ts
import { redis } from '@/lib/redis';
import bcrypt from 'bcryptjs'; // ✅ Add this import

async function initRedis() {
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

  console.log('✅ Redis initialized!');
  console.log('📧 Admin Email: admin@hopeenergy.com');
  console.log('🔑 Admin Password: admin123');
  console.log('⚠️  Please change the password after first login!');
}

initRedis().catch(console.error);
