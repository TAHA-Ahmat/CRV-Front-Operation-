/**
 * Offline Service
 * Manages reading/writing to local IndexedDB cache
 * Abstraction layer over Dexie database
 */

import db from './dexie.db.js';

export class OfflineService {
  /**
   * Save an entity to local cache
   * @param {string} entityType - Type of entity (CRV, Phase, Vol)
   * @param {object} entity - Entity to cache
   * @returns {Promise} Save result
   */
  async saveEntity(entityType, entity) {
    const table = this._getTable(entityType);

    if (!table) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    // Add or update in cache
    return table.put({
      ...entity,
      _id: entity._id || entity.id,
      _syncedAt: new Date()
    });
  }

  /**
   * Save multiple entities (bulk operation)
   * @param {string} entityType - Type of entity
   * @param {array} entities - Array of entities to save
   * @returns {Promise} Number of items saved
   */
  async saveEntities(entityType, entities) {
    const table = this._getTable(entityType);

    if (!table) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    const enriched = entities.map(entity => ({
      ...entity,
      _id: entity._id || entity.id,
      _syncedAt: new Date()
    }));

    return table.bulkPut(enriched);
  }

  /**
   * Retrieve an entity from cache
   * @param {string} entityType - Type of entity
   * @param {string} entityId - Entity ID
   * @returns {Promise} Entity or null
   */
  async getEntity(entityType, entityId) {
    const table = this._getTable(entityType);

    if (!table) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    return table.get(entityId);
  }

  /**
   * Query entities with filters
   * @param {string} entityType - Type of entity
   * @param {object} filters - Query filters
   * @returns {Promise} Filtered array
   */
  async queryEntities(entityType, filters = {}) {
    const table = this._getTable(entityType);

    if (!table) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }

    let collection = table.toCollection();

    // Apply filters
    if (filters.statut) {
      collection = collection.where('statut').equals(filters.statut);
    }

    if (filters.crvId) {
      collection = collection.where('crvId').equals(filters.crvId);
    }

    if (filters.search) {
      // Client-side search (can be optimized later)
      const results = await collection.toArray();
      const searchLower = filters.search.toLowerCase();

      return results.filter(item => {
        const searchText = JSON.stringify(item).toLowerCase();
        return searchText.includes(searchLower);
      });
    }

    if (filters.sortBy) {
      const [field, direction] = filters.sortBy.split(':');
      collection = collection.sortBy(field);
      if (direction === 'desc') {
        collection = collection.reverse();
      }
    }

    if (filters.limit) {
      return collection.limit(filters.limit).toArray();
    }

    return collection.toArray();
  }

  /**
   * Add operation to sync queue
   * @param {object} operation - Operation to queue
   * @returns {Promise} Queue entry ID
   */
  async queueOperation(operation) {
    return db.operations.add({
      ...operation,
      timestamp: operation.timestamp || new Date(),
      status: 'pending'
    });
  }

  /**
   * Add multiple operations to queue (bulk)
   * @param {array} operations - Operations to queue
   * @returns {Promise} Number added
   */
  async queueOperations(operations) {
    const enriched = operations.map(op => ({
      ...op,
      timestamp: op.timestamp || new Date(),
      status: 'pending'
    }));

    return db.operations.bulkAdd(enriched);
  }

  /**
   * Get pending operations not yet synced
   * @param {number} limit - Max to return
   * @returns {Promise} Array of pending operations
   */
  async getPendingOperations(limit = 100) {
    return db.operations
      .where('status')
      .equals('pending')
      .limit(limit)
      .toArray();
  }

  /**
   * Mark operations as acknowledged/synced
   * @param {array} operationIds - IDs to mark
   * @param {string} status - New status (acknowledged, synced, failed)
   * @returns {Promise} Number updated
   */
  async markOperationsStatus(operationIds, status = 'acknowledged') {
    if (!operationIds || operationIds.length === 0) {
      return 0;
    }

    let updated = 0;

    for (const opId of operationIds) {
      const op = await db.operations.get(opId);
      if (op) {
        await db.operations.update(opId, {
          status,
          acknowledgedAt: new Date()
        });
        updated++;
      }
    }

    return updated;
  }

  /**
   * Add item to sync queue for tracking
   * @param {object} queueItem - Sync queue entry
   * @returns {Promise} Queue entry ID
   */
  async addToSyncQueue(queueItem) {
    return db.syncQueue.add({
      ...queueItem,
      timestamp: queueItem.timestamp || new Date(),
      status: queueItem.status || 'pending'
    });
  }

  /**
   * Get sync queue status
   * @param {string} status - Filter by status
   * @returns {Promise} Queue entries
   */
  async getSyncQueueStatus(status = null) {
    let query = db.syncQueue;

    if (status) {
      query = query.where('status').equals(status);
    }

    return query.reverse().toArray();
  }

  /**
   * Clear old synced operations (cleanup)
   * @param {number} daysOld - Delete operations older than N days
   * @returns {Promise} Number deleted
   */
  async clearOldOperations(daysOld = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldOps = await db.operations
      .where('timestamp')
      .below(cutoffDate)
      .and(op => op.status === 'acknowledged')
      .toArray();

    const deletedIds = oldOps.map(op => op._id);

    if (deletedIds.length > 0) {
      await db.operations.bulkDelete(deletedIds);
    }

    return deletedIds.length;
  }

  /**
   * Save sync state (vector clock, last sync time)
   * @param {object} state - State to save
   * @returns {Promise}
   */
  async saveSyncState(state) {
    return db.syncState.put({
      clientId: state.clientId,
      lastSync: state.lastSync || new Date(),
      vectorClock: state.vectorClock || {},
      acknowledgingVersion: state.acknowledgingVersion || {}
    });
  }

  /**
   * Get sync state
   * @param {string} clientId - Client identifier
   * @returns {Promise} Sync state or null
   */
  async getSyncState(clientId) {
    return db.syncState.get(clientId);
  }

  /**
   * Get database stats (for monitoring)
   * @returns {Promise} Storage stats
   */
  async getStats() {
    const crvCount = await db.crvs.count();
    const phaseCount = await db.phases.count();
    const operationCount = await db.operations.count();
    const pendingCount = await db.operations
      .where('status')
      .equals('pending')
      .count();

    return {
      crvs: crvCount,
      phases: phaseCount,
      totalOperations: operationCount,
      pendingOperations: pendingCount,
      timestamp: new Date()
    };
  }

  /**
   * Clear all local data (nuclear option - use with caution)
   * @returns {Promise}
   */
  async clearAll() {
    await db.crvs.clear();
    await db.phases.clear();
    await db.operations.clear();
    await db.syncQueue.clear();
    // Keep syncState for client ID
  }

  /**
   * Get table by entity type
   * @private
   * @param {string} entityType - Type of entity
   * @returns {Dexie.Table} Table reference
   */
  _getTable(entityType) {
    const tableMap = {
      CRV: db.crvs,
      Phase: db.phases,
      Vol: db.phases // Vols stored in phases for now
    };

    return tableMap[entityType] || null;
  }

  /**
   * Verify database is accessible
   * @returns {Promise} true if working
   */
  async isAvailable() {
    try {
      await db.open();
      const stats = await this.getStats();
      return stats !== null;
    } catch (error) {
      console.error('Offline DB not available:', error);
      return false;
    }
  }
}

export default new OfflineService();
