interface SheetConfig {
  sheetId: string;
  sheetName: string;
  serviceAccountEmail: string;
  privateKey: string;
  lastSync?: Date;
}

// Option 1: Use environment variables (current approach)
// Option 2: Store in database (recommended for multi-tenant)
// Option 3: Store in Redis (fast access)

// For now, using a simple in-memory store with fallback to env
let cachedConfig: SheetConfig | null = null;

export async function getSheetConfig(): Promise<SheetConfig> {
  // If already cached, return it
  if (cachedConfig) {
    return cachedConfig;
  }

  // TODO: In production, fetch from database based on tenantId
  // For now, use environment variables as fallback
  const config: SheetConfig = {
    sheetId: process.env.GOOGLE_SHEET_ID || '',
    sheetName: process.env.GOOGLE_SHEET_NAME || 'Sheet1',
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    privateKey: process.env.GOOGLE_PRIVATE_KEY || '',
  };

  cachedConfig = config;
  return config;
}

export async function saveSheetConfig(config: SheetConfig): Promise<void> {
  // Cache the config
  cachedConfig = config;

  // TODO: In production, save to database
  // Example with Prisma:
  // await prisma.sheetConfig.upsert({
  //   where: { tenantId: getCurrentTenantId() },
  //   update: config,
  //   create: { ...config, tenantId: getCurrentTenantId() }
  // });

  console.log('Sheet config saved (in-memory only - implement database storage for production)');
}

export function clearConfigCache(): void {
  cachedConfig = null;
}

// For multi-tenant: Add tenant-specific config retrieval
export async function getTenantSheetConfig(tenantId: string): Promise<SheetConfig> {
  // TODO: Implement database lookup by tenantId
  // For now, return default config
  return getSheetConfig();
}