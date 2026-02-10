// src/lib/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Organization helpers
export async function getOrganization(orgId: string) {
  return await redis.get(`org:${orgId}:info`);
}

export async function saveOrganization(orgId: string, data: any) {
  await redis.set(`org:${orgId}:info`, data);
}

// Admin helpers (NEW)
export async function getAdmin(email: string) {
  return await redis.get(`admin:${email}:info`);
}

export async function saveAdmin(email: string, data: any) {
  await redis.set(`admin:${email}:info`, data);
  await redis.sadd(`org:${data.organizationId}:admins`, email);
}

// User helpers (UPDATED - use user ID, not email as key)
export async function getUserById(userId: string) {
  return await redis.get(`user:${userId}:info`);
}

export async function getUserByEmail(email: string) {
  const userId = await redis.get(`user:email:${email}`);
  if (!userId) return null;
  return await redis.get(`user:${userId}:info`);
}

export async function saveUser(userId: string, data: any) {
  await redis.set(`user:${userId}:info`, data);
  await redis.set(`user:email:${data.email}`, userId); // Email lookup
  await redis.sadd(`org:${data.organizationId}:users`, userId);
  
  if (data.departmentId) {
    await redis.sadd(`dept:${data.departmentId}:users`, userId);
  }
}

export async function getOrganizationUsers(orgId: string) {
  const userIds = await redis.smembers(`org:${orgId}:users`);
  const users = await Promise.all(
    userIds.map(id => getUserById(id))
  );
  return users.filter(Boolean); // Remove nulls
}

// Department helpers (NEW)
export async function getDepartment(deptId: string) {
  return await redis.get(`dept:${deptId}:info`);
}

export async function saveDepartment(deptId: string, data: any) {
  await redis.set(`dept:${deptId}:info`, data);
  await redis.sadd(`org:${data.organizationId}:departments`, deptId);
}

export async function getOrganizationDepartments(orgId: string) {
  const deptIds = await redis.smembers(`org:${orgId}:departments`);
  const departments = await Promise.all(
    deptIds.map(id => getDepartment(id))
  );
  return departments.filter(Boolean);
}
// Telegram helpers
export async function saveTelegramChatId(userId: string, chatId: string) {
  await redis.set(`user:${userId}:telegram`, chatId);
  // Also save reverse lookup
  await redis.set(`telegram:chatid:${chatId}`, userId);
}

export async function getTelegramChatId(userId: string) {
  return await redis.get(`user:${userId}:telegram`);
}

export async function getUserByTelegramChatId(chatId: string) {
  const userId = await redis.get(`telegram:chatid:${chatId}`);
  if (!userId) return null;
  return await getUserById(userId as string);
}

export async function removeTelegramChatId(userId: string) {
  const chatId = await redis.get(`user:${userId}:telegram`);
  if (chatId) {
    await redis.del(`telegram:chatid:${chatId}`);
  }
  await redis.del(`user:${userId}:telegram`);
}