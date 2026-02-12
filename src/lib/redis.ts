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
// ============================================
// TELEGRAM HELPERS
// ============================================

/** Save organization Telegram bot token */
export async function saveTelegramBotToken(orgId: string, token: string) {
  await redis.set(`org:${orgId}:telegram:bot_token`, token);
}

/** Get organization Telegram bot token */
export async function getTelegramBotToken(orgId: string): Promise<string | null> {
  return await redis.get(`org:${orgId}:telegram:bot_token`) as string | null;
}

/** Save organization Telegram GROUP chat ID */
export async function saveTelegramGroupChatId(orgId: string, chatId: string) {
  await redis.set(`org:${orgId}:telegram:group_chat_id`, chatId);
}

/** Get organization Telegram GROUP chat ID */
export async function getTelegramGroupChatId(orgId: string): Promise<string | null> {
  return await redis.get(`org:${orgId}:telegram:group_chat_id`) as string | null;
}

/** Save user's personal Telegram chat ID */
export async function saveUserTelegramChatId(userEmail: string, chatId: string, name?: string) {
  await redis.set(`user:${userEmail}:telegram:chat_id`, chatId);
  // Reverse lookup
  await redis.set(`telegram:chatid:${chatId}`, userEmail);
  if (name) {
    await redis.set(`user:${userEmail}:telegram:name`, name);
  }
}

/** Get user's personal Telegram chat ID */
export async function getUserTelegramChatId(userEmail: string): Promise<string | null> {
  return await redis.get(`user:${userEmail}:telegram:chat_id`) as string | null;
}

/** Get user email by Telegram chat ID (reverse lookup) */
export async function getUserEmailByTelegramChatId(chatId: string): Promise<string | null> {
  return await redis.get(`telegram:chatid:${chatId}`) as string | null;
}

/** Remove user's Telegram connection */
export async function removeUserTelegramChatId(userEmail: string) {
  const chatId = await getUserTelegramChatId(userEmail);
  if (chatId) {
    await redis.del(`telegram:chatid:${chatId}`);
  }
  await redis.del(`user:${userEmail}:telegram:chat_id`);
  await redis.del(`user:${userEmail}:telegram:name`);
}

/** Get all users' Telegram chat IDs for an organization */
export async function getOrgUsersTelegramChatIds(orgId: string): Promise<Map<string, string>> {
  const users = await getOrganizationUsers(orgId);
  const chatIds = new Map<string, string>();
  
  for (const user of users) {
    // ✅ Type assertion to fix TypeScript error
    const typedUser = user as { email: string; name: string; isActive: boolean };
    const chatId = await getUserTelegramChatId(typedUser.email);
    if (chatId) {
      chatIds.set(typedUser.email, chatId);
    }
  }
  
  return chatIds;
}

// ============================================
// CACHE HELPERS FOR GOOGLE SHEETS DATA
// ============================================

/**
 * Generic cache setter for any sheet tab
 */
export async function cacheSheetData(
  orgId: string, 
  tabName: string, 
  data: any[], 
  updatedBy?: string
) {
  const timestamp = Date.now();
  const cacheKey = `org:${orgId}:cache:${tabName.toLowerCase()}`;
  
  await redis.set(cacheKey, JSON.stringify(data));
  await redis.set(`${cacheKey}:timestamp`, timestamp);
  
  if (updatedBy) {
    await redis.set(`${cacheKey}:updated_by`, updatedBy);
  }
  
  // Set TTL to 5 minutes (300 seconds)
  await redis.expire(cacheKey, 300);
  await redis.expire(`${cacheKey}:timestamp`, 300);
  
  console.log(`✅ Cached ${tabName} for org:${orgId} (${data.length} rows)`);
}

/**
 * Generic cache getter for any sheet tab
 */
export async function getCachedSheetData(orgId: string, tabName: string) {
  const cacheKey = `org:${orgId}:cache:${tabName.toLowerCase()}`;
  const cached = await redis.get(cacheKey);
  
  if (!cached) return null;
  
  const timestamp = await redis.get(`${cacheKey}:timestamp`);
  const updatedBy = await redis.get(`${cacheKey}:updated_by`);
  
  return {
    data: typeof cached === 'string' ? JSON.parse(cached) : cached,
    timestamp: timestamp as number,
    updatedBy: updatedBy as string | null,
  };
}

/**
 * Invalidate cache for a specific tab
 */
export async function invalidateSheetCache(orgId: string, tabName: string) {
  const cacheKey = `org:${orgId}:cache:${tabName.toLowerCase()}`;
  await redis.del(cacheKey);
  await redis.del(`${cacheKey}:timestamp`);
  await redis.del(`${cacheKey}:updated_by`);
  console.log(`🗑️ Cache invalidated for ${tabName} in org:${orgId}`);
}

/**
 * Invalidate ALL caches for an organization
 */
export async function invalidateAllOrgCaches(orgId: string) {
  const tabs = [
    'leads', 'enquiries', 'users', 'followups', 
    'activity_log', 'project_stages', 'settings', 
    'departments', 'survey_details'
  ];
  
  for (const tab of tabs) {
    await invalidateSheetCache(orgId, tab);
  }
  
  console.log(`🗑️ All caches invalidated for org:${orgId}`);
}

/**
 * Get cache timestamp for a specific tab
 */
export async function getCacheTimestamp(orgId: string, tabName: string = 'enquiries'): Promise<number | null> {
  const cacheKey = `org:${orgId}:cache:${tabName.toLowerCase()}`;
  const timestamp = await redis.get(`${cacheKey}:timestamp`);
  return timestamp as number | null;
}

// Convenience helpers for backwards compatibility
export async function cacheEnquiries(orgId: string, enquiries: any[], updatedBy?: string) {
  return cacheSheetData(orgId, 'enquiries', enquiries, updatedBy);
}

export async function getCachedEnquiries(orgId: string) {
  return getCachedSheetData(orgId, 'enquiries');
}

export async function invalidateEnquiriesCache(orgId: string) {
  return invalidateSheetCache(orgId, 'enquiries');
}

export async function cacheLeads(orgId: string, leads: any[], updatedBy?: string) {
  return cacheSheetData(orgId, 'leads', leads, updatedBy);
}

export async function getCachedLeads(orgId: string) {
  return getCachedSheetData(orgId, 'leads');
}

export async function invalidateLeadsCache(orgId: string) {
  return invalidateSheetCache(orgId, 'leads');
}
