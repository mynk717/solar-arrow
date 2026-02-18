// Centralized cache invalidation logic
// Ensures data consistency across all modules

import { redis } from './redis';

export type CacheEntity = 
  | 'enquiry'
  | 'lead'
  | 'liaison'
  | 'installation'
  | 'bom'
  | 'payment'
  | 'wcr'
  | 'user'
  | 'branch'
  | 'all';

// Cache key patterns for each entity type
const CACHE_KEY_PATTERNS: Record<CacheEntity, (orgId: string) => string[]> = {
  enquiry: (orgId) => [
    `org:${orgId}:enquiries`,
    `org:${orgId}:enquiries:*`,
  ],
  lead: (orgId) => [
    `org:${orgId}:leads`,
    `org:${orgId}:leads:*`,
  ],
  liaison: (orgId) => [
    `org:${orgId}:liaisons:all`,
    `org:${orgId}:liaisons:*`,
  ],
  installation: (orgId) => [
    `org:${orgId}:installations`,
    `org:${orgId}:installations:*`,
  ],
  bom: (orgId) => [
    `org:${orgId}:boms`,
    `org:${orgId}:boms:*`,
  ],
  payment: (orgId) => [
    `org:${orgId}:payments`,
    `org:${orgId}:payments:*`,
  ],
  wcr: (orgId) => [
    `org:${orgId}:wcrs`,
    `org:${orgId}:wcrs:*`,
  ],
  user: (orgId) => [
    `org:${orgId}:users`,
    `org:${orgId}:users:*`,
  ],
  branch: (orgId) => [
    `org:${orgId}:branches`,
    `org:${orgId}:branches:*`,
  ],
  all: (orgId) => [
    `org:${orgId}:*`,
  ],
};

// Related entities - when one entity changes, these also need invalidation
const RELATED_ENTITIES: Record<CacheEntity, CacheEntity[]> = {
  enquiry: ['liaison', 'installation', 'bom', 'payment', 'wcr'], // Enquiry affects everything
  lead: [], // Leads are independent
  liaison: ['enquiry'], // Liaison changes affect enquiry status
  installation: ['enquiry', 'liaison', 'wcr'], // Installation affects multiple modules
  bom: ['enquiry', 'installation'], // BOM affects enquiry and installation
  payment: ['enquiry'], // Payment affects enquiry status
  wcr: ['enquiry', 'liaison'], // WCR affects enquiry and liaison
  user: [], // Users are independent
  branch: [], // Branches are independent
  all: [], // All clears everything
};

/**
 * Invalidate cache for specific entity types
 * @param orgId - Organization ID
 * @param entities - Array of entity types to invalidate
 * @param includeRelated - Whether to also invalidate related entities (default: true)
 */
export async function invalidateCache(
  orgId: string,
  entities: CacheEntity | CacheEntity[],
  includeRelated: boolean = true
): Promise<void> {
  try {
    const entitiesToInvalidate = Array.isArray(entities) ? entities : [entities];
    const allEntitiesToInvalidate = new Set<CacheEntity>(entitiesToInvalidate);

    // Add related entities if requested
    if (includeRelated) {
      entitiesToInvalidate.forEach(entity => {
        const related = RELATED_ENTITIES[entity] || [];
        related.forEach(rel => allEntitiesToInvalidate.add(rel));
      });
    }

    // Collect all cache keys to delete
    const keysToDelete: string[] = [];
    
    allEntitiesToInvalidate.forEach(entity => {
      const patterns = CACHE_KEY_PATTERNS[entity](orgId);
      keysToDelete.push(...patterns);
    });

    // Delete all keys (handling wildcards)
    const deletePromises = keysToDelete.map(async (key) => {
      if (key.includes('*')) {
        // Handle wildcard keys
        const pattern = key;
        try {
          // Use SCAN to find matching keys
          const matchingKeys = await scanKeys(pattern);
          if (matchingKeys.length > 0) {
            await redis.del(...matchingKeys);
          }
        } catch (error) {
          console.error(`Error deleting wildcard pattern ${pattern}:`, error);
        }
      } else {
        // Direct key deletion
        try {
          await redis.del(key);
        } catch (error) {
          console.error(`Error deleting key ${key}:`, error);
        }
      }
    });

    await Promise.all(deletePromises);

    console.log(`✅ Cache invalidated for org ${orgId}:`, Array.from(allEntitiesToInvalidate));
  } catch (error) {
    console.error('❌ Cache invalidation error:', error);
    // Don't throw - cache invalidation failure shouldn't break the application
  }
}

/**
 * Scan Redis for keys matching a pattern
 * @param pattern - Redis key pattern (supports *)
 */
async function scanKeys(pattern: string): Promise<string[]> {
  const allKeys: string[] = [];
  let cursor = 0;

  try {
    do {
      // @ts-ignore - Redis scan has varying type definitions across versions
      const result = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      
      // Handle different Redis client response formats
      if (Array.isArray(result)) {
        // Format: [cursor, [keys]]
        cursor = parseInt(result[0] as string, 10);
        const keys = result[1] as string[];
        if (Array.isArray(keys)) {
          allKeys.push(...keys);
        }
      } else if (result && typeof result === 'object') {
        // Format: { cursor, keys }
        cursor = (result as any).cursor || 0;
        const keys = (result as any).keys || [];
        if (Array.isArray(keys)) {
          allKeys.push(...keys);
        }
      } else {
        break;
      }
    } while (cursor !== 0);
  } catch (error) {
    console.error('Error scanning Redis keys:', error);
  }

  return allKeys;
}



/**
 * Invalidate enquiry-related caches (most common operation)
 */
export async function invalidateEnquiryCache(orgId: string): Promise<void> {
  await invalidateCache(orgId, 'enquiry', true);
}

/**
 * Invalidate all caches for an organization (nuclear option)
 */
export async function invalidateAllCache(orgId: string): Promise<void> {
  await invalidateCache(orgId, 'all', false);
}

/**
 * Invalidate cache with timestamp tracking
 * Useful for debugging and monitoring
 */
export async function invalidateCacheWithTimestamp(
  orgId: string,
  entities: CacheEntity | CacheEntity[],
  reason?: string
): Promise<void> {
  const timestamp = new Date().toISOString();
  const entityList = Array.isArray(entities) ? entities.join(', ') : entities;
  
  console.log(`🔄 [${timestamp}] Cache invalidation triggered:`, {
    orgId,
    entities: entityList,
    reason: reason || 'Not specified',
  });

  await invalidateCache(orgId, entities, true);

  // Store invalidation timestamp in Redis for monitoring
  const timestampKey = `org:${orgId}:cache:last_invalidation`;
  try {
    await redis.setex(timestampKey, 86400, timestamp); // ✅ CORRECT

  } catch (error) {
    console.error('Error storing invalidation timestamp:', error);
  }
}

/**
 * Get last cache invalidation timestamp
 */
export async function getLastCacheInvalidation(orgId: string): Promise<string | null> {
  const timestampKey = `org:${orgId}:cache:last_invalidation`;
  try {
    return await redis.get(timestampKey) as string | null;
  } catch (error) {
    console.error('Error getting invalidation timestamp:', error);
    return null;
  }
}

/**
 * Invalidate specific enquiry cache by ID
 */
export async function invalidateEnquiryById(orgId: string, enquiryId: string): Promise<void> {
  try {
    const specificKey = `org:${orgId}:enquiries:${enquiryId}`;
    await redis.del(specificKey);
    
    // Also invalidate list caches
    await invalidateCache(orgId, 'enquiry', true);
  } catch (error) {
    console.error('Error invalidating specific enquiry:', error);
  }
}

/**
 * Batch invalidate multiple enquiries
 */
export async function invalidateEnquiriesByIds(
  orgId: string,
  enquiryIds: string[]
): Promise<void> {
  try {
    const keys = enquiryIds.map(id => `org:${orgId}:enquiries:${id}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    
    // Also invalidate list caches
    await invalidateCache(orgId, 'enquiry', true);
  } catch (error) {
    console.error('Error batch invalidating enquiries:', error);
  }
}
