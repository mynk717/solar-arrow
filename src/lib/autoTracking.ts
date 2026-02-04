import { appendSheetRow } from './googleSheets';

export async function trackChange(
  enquiryId: string,
  userId: string,
  action: string,
  fieldName: string,
  oldValue: any,
  newValue: any
) {
  try {
    await appendSheetRow('ACTIVITY_LOG', [
      new Date().toISOString(),
      enquiryId,
      userId,
      action,
      fieldName,
      JSON.stringify(oldValue),
      JSON.stringify(newValue),
      ''
    ]);
  } catch (error) {
    console.error('Error tracking change:', error);
  }
}

export async function updateWithTracking(
  enquiry: any,
  updates: any,
  userId: string
) {
  // Track each changed field
  for (const [key, newValue] of Object.entries(updates)) {
    if (enquiry[key] !== newValue) {
      await trackChange(
        enquiry.id,
        userId,
        'update',
        key,
        enquiry[key],
        newValue
      );
    }
  }

  // Return updated enquiry with tracking fields
  return {
    ...enquiry,
    ...updates,
    lastEditedBy: userId,
    lastEditedAt: new Date().toISOString()
  };
}