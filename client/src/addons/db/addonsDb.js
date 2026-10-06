import { openDB } from 'idb';

const ADDONS_DB_NAME = 'signify_addons';
const ADDONS_DB_VERSION = 1;

let addonsDbPromise = null;

export function getAddonsDB() {
  if (!addonsDbPromise) {
    addonsDbPromise = openDB(ADDONS_DB_NAME, ADDONS_DB_VERSION, {
      upgrade(db) {
        // Store for emphasis & key concept tags
        if (!db.objectStoreNames.contains('tags')) {
          const tagStore = db.createObjectStore('tags', { keyPath: 'id' });
          tagStore.createIndex('sessionId', 'sessionId', { unique: false });
        }
        // Store for alert log history
        if (!db.objectStoreNames.contains('alerts')) {
          const alertStore = db.createObjectStore('alerts', { keyPath: 'id' });
          alertStore.createIndex('sessionId', 'sessionId', { unique: false });
        }
        // Store for student preferences
        if (!db.objectStoreNames.contains('user_preferences')) {
          db.createObjectStore('user_preferences', { keyPath: 'key' });
        }
      }
    });
  }
  return addonsDbPromise;
}

export async function saveAddonTag(tag) {
  try {
    const db = await getAddonsDB();
    await db.put('tags', tag);
  } catch (err) {
    console.error('[SIGNIFY ADDONS IDB] Failed to save tag:', err);
  }
}

export async function getAddonTagsForSession(sessionId) {
  try {
    const db = await getAddonsDB();
    const tx = db.transaction('tags', 'readonly');
    const index = tx.objectStore('tags').index('sessionId');
    return await index.getAll(sessionId);
  } catch (err) {
    console.error('[SIGNIFY ADDONS IDB] Failed to load tags:', err);
    return [];
  }
}

export async function saveAddonAlert(alert) {
  try {
    const db = await getAddonsDB();
    await db.put('alerts', alert);
  } catch (err) {
    console.error('[SIGNIFY ADDONS IDB] Failed to save alert:', err);
  }
}

export async function getAddonAlertsForSession(sessionId) {
  try {
    const db = await getAddonsDB();
    const tx = db.transaction('alerts', 'readonly');
    const index = tx.objectStore('alerts').index('sessionId');
    return await index.getAll(sessionId);
  } catch (err) {
    console.error('[SIGNIFY ADDONS IDB] Failed to load alerts:', err);
    return [];
  }
}
