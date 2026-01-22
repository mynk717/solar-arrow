// src/lib/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Helper functions
export async function getOrganization(orgId: string) {
  return await redis.get(`org:${orgId}:info`);
}

export async function saveOrganization(orgId: string, data: any) {
  await redis.set(`org:${orgId}:info`, data);
}

export async function getUserByEmail(email: string) {
  return await redis.get(`user:${email}:info`);
}

export async function saveUser(email: string, data: any) {
  await redis.set(`user:${email}:info`, data);
  // Add to org's user set
  await redis.sadd(`org:${data.organizationId}:users`, email);
}

export async function getOrganizationUsers(orgId: string) {
  const userEmails = await redis.smembers(`org:${orgId}:users`);
  const users = await Promise.all(
    userEmails.map(email => getUserByEmail(email))
  );
  return users;
}
