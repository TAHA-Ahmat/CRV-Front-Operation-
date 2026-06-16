/**
 * Dexie Database Setup
 * IndexedDB wrapper for offline-first frontend storage
 * Handles schema versioning and migrations
 */

import Dexie from 'dexie';

export const db = new Dexie('CRVOfflineDB');

/**
 * Define database schema
 * Each version can add new stores or modify indexes
 */
db.version(1).stores({
  // Core entity caches
  crvs: '++_id, numeroEngin, statut, createdAt, [numeroEngin+statut]',
  phases: '++_id, crvId, numero, timestamp, [crvId+numero]',

  // Operation log for sync
  operations: '++_id, clientId, timestamp, entityId, [clientId+timestamp]',

  // Sync queue tracking
  syncQueue: '++_id, timestamp, status, [status+timestamp]',

  // Local metadata
  syncState: 'clientId'
});

/**
 * Migration hooks (if needed in future versions)
 */
db.on('populate', () => {
  // Initialize empty sync state
  db.syncState.add({
    clientId: null,
    lastSync: null,
    vectorClock: {}
  });
});

export default db;
