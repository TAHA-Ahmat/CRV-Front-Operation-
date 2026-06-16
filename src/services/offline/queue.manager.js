/**
 * Offline Queue Manager
 * Manages operation queue, retries, and sync batching
 * Implements exponential backoff and smart sync scheduling
 */

import { v4 as uuid } from 'uuid';
import offlineService from './offline.service.js';

export class QueueManager {
  constructor(options = {}) {
    this.queue = [];
    this.processing = false;
    this.retryCount = new Map();
    this.maxRetries = options.maxRetries || 3;
    this.batchSize = options.batchSize || 50;
    this.maxWaitTime = options.maxWaitTime || 5000; // 5 seconds
    this.baseRetryDelay = options.baseRetryDelay || 1000; // 1 second

    // Bind methods to preserve this
    this.onOnline = this.onOnline.bind(this);
    this.onOffline = this.onOffline.bind(this);

    // Setup online/offline listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.onOnline);
      window.addEventListener('offline', this.onOffline);
    }
  }

  /**
   * Enqueue a single operation
   * Persists to local DB immediately
   *
   * @param {object} operation - Operation to queue
   * @returns {Promise} Operation ID
   */
  async enqueue(operation) {
    const queuedOp = {
      id: operation.id || uuid(),
      ...operation,
      timestamp: operation.timestamp || Date.now(),
      retries: 0,
      status: 'pending',
      errors: []
    };

    // Add to queue
    this.queue.push(queuedOp);

    // Persist to IndexedDB
    const opId = await offlineService.queueOperation(queuedOp);

    // Try to process if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return queuedOp.id;
  }

  /**
   * Enqueue multiple operations (bulk)
   * @param {array} operations - Operations to queue
   * @returns {Promise} Array of operation IDs
   */
  async enqueueBatch(operations) {
    const ids = [];

    for (const op of operations) {
      const id = await this.enqueue(op);
      ids.push(id);
    }

    return ids;
  }

  /**
   * Process queue - sync pending operations to server
   * Implements batching, retries, and exponential backoff
   *
   * @param {function} syncFn - Async function to call for sync
   * @returns {Promise} Sync result
   */
  async processQueue(syncFn) {
    if (this.processing || !navigator.onLine) {
      return { queued: this.queue.length, processed: 0 };
    }

    this.processing = true;
    let processed = 0;
    let failed = 0;

    try {
      while (this.queue.length > 0) {
        // Get next batch
        const batch = this.queue.splice(0, this.batchSize);

        // Try to sync batch
        const result = await this._syncBatch(batch, syncFn);

        if (result.success) {
          processed += batch.length;

          // Mark as acknowledged in local DB
          await offlineService.markOperationsStatus(
            batch.map(op => op.id),
            'acknowledged'
          );

          // Clear retry count for successful ops
          batch.forEach(op => this.retryCount.delete(op.id));
        } else {
          // Handle failed batch
          failed += batch.length;

          // Re-add to queue with retry logic
          for (const op of batch) {
            const retries = this.retryCount.get(op.id) || 0;

            if (retries < this.maxRetries) {
              const delay = this._exponentialBackoff(retries);
              console.warn(
                `Operation ${op.id} retry ${retries + 1}/${this.maxRetries}, waiting ${delay}ms`
              );

              // Wait before retry
              await this._wait(delay);

              // Increment retry and re-add to queue
              this.retryCount.set(op.id, retries + 1);
              op.retries = retries + 1;
              op.errors = op.errors || [];
              op.errors.push({
                timestamp: new Date(),
                message: result.error || 'Sync failed'
              });

              this.queue.push(op);
            } else {
              // Max retries exceeded
              console.error(`Operation ${op.id} failed after ${this.maxRetries} retries`);
              await offlineService.markOperationsStatus([op.id], 'failed');
            }
          }

          // Stop processing if sync fails
          break;
        }
      }
    } catch (error) {
      console.error('Queue processing error:', error);
      this.processing = false;
      throw error;
    }

    this.processing = false;

    return {
      processed,
      failed,
      queued: this.queue.length,
      timestamp: new Date()
    };
  }

  /**
   * Sync a batch of operations
   * @private
   * @param {array} batch - Operations to sync
   * @param {function} syncFn - Async sync function
   * @returns {Promise} Result {success, error}
   */
  async _syncBatch(batch, syncFn) {
    try {
      if (!syncFn || typeof syncFn !== 'function') {
        throw new Error('No sync function provided');
      }

      const result = await syncFn(batch);

      if (result.success === false) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (error) {
      console.error('Batch sync error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate exponential backoff delay
   * @private
   * @param {number} retryCount - Number of retries so far
   * @returns {number} Delay in milliseconds
   */
  _exponentialBackoff(retryCount) {
    // Delay: 1s, 2s, 4s, 8s, etc.
    const delay = this.baseRetryDelay * Math.pow(2, retryCount);
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 1000;
    return Math.min(delay + jitter, 30000); // Cap at 30s
  }

  /**
   * Simple delay utility
   * @private
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise}
   */
  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle coming back online
   * @private
   */
  onOnline() {
    console.log('Network restored, processing queue...');
    if (this.queue.length > 0 && !this.processing) {
      // Dispatch event for app to handle sync
      window.dispatchEvent(new CustomEvent('offline-queue:online'));
    }
  }

  /**
   * Handle going offline
   * @private
   */
  onOffline() {
    console.log('Network lost, queue suspended');
    this.processing = false;
    window.dispatchEvent(new CustomEvent('offline-queue:offline'));
  }

  /**
   * Get queue status
   * @returns {object} Queue statistics
   */
  getStatus() {
    return {
      queued: this.queue.length,
      processing: this.processing,
      isOnline: navigator.onLine,
      timestamp: new Date()
    };
  }

  /**
   * Get pending operation details
   * @param {number} limit - Max to return
   * @returns {Promise} Array of pending operations
   */
  async getPending(limit = 20) {
    return offlineService.getPendingOperations(limit);
  }

  /**
   * Clear specific operation from queue
   * @param {string} operationId - ID to remove
   * @returns {Promise}
   */
  async removeOperation(operationId) {
    // Remove from memory queue
    this.queue = this.queue.filter(op => op.id !== operationId);

    // Mark as failed in DB
    await offlineService.markOperationsStatus([operationId], 'failed');

    // Clear retry count
    this.retryCount.delete(operationId);
  }

  /**
   * Clear entire queue (warning: data loss!)
   * @returns {Promise}
   */
  async clearQueue() {
    this.queue = [];
    this.retryCount.clear();
    await offlineService.clearAll();
  }

  /**
   * Restore queue from IndexedDB
   * Called on app startup
   * @returns {Promise} Restored operations count
   */
  async restoreFromStorage() {
    const pending = await offlineService.getPendingOperations(1000);

    // Add back to memory queue
    for (const op of pending) {
      if (op.status === 'pending') {
        this.queue.push({
          ...op,
          retries: op.retries || 0
        });
      }
    }

    console.log(`Restored ${this.queue.length} pending operations from storage`);
    return this.queue.length;
  }

  /**
   * Cleanup old synced operations
   * @returns {Promise} Number deleted
   */
  async cleanup() {
    return offlineService.clearOldOperations(7);
  }

  /**
   * Destroy queue manager and cleanup listeners
   */
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.onOnline);
      window.removeEventListener('offline', this.onOffline);
    }
  }
}

export default new QueueManager();
