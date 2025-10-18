import { getUnsyncedNotes, markAsSynced } from './db';

let syncInProgress = false;
let syncCallbacks: Array<(syncing: boolean) => void> = [];

export function onSyncStateChange(callback: (syncing: boolean) => void) {
  syncCallbacks.push(callback);
  return () => {
    syncCallbacks = syncCallbacks.filter(cb => cb !== callback);
  };
}

function notifySyncState(syncing: boolean) {
  syncInProgress = syncing;
  syncCallbacks.forEach(cb => cb(syncing));
}

export async function syncNotes() {
  if (syncInProgress || !navigator.onLine) return;

  notifySyncState(true);

  try {
    const unsyncedNotes = await getUnsyncedNotes();
    
    if (unsyncedNotes.length === 0) {
      notifySyncState(false);
      return;
    }

    // TODO: Replace with actual API endpoint when Lovable Cloud is connected
    // For now, we'll simulate a sync delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mark all notes as synced
    for (const note of unsyncedNotes) {
      await markAsSynced(note.id);
    }

    console.log(`Synced ${unsyncedNotes.length} notes`);
  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    notifySyncState(false);
  }
}

// Auto-sync when coming online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online, syncing...');
    syncNotes();
  });
}
