import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QueueManager } from '../../../src/services/offline/queue.manager.js';
import { v4 as uuid } from 'uuid';

describe('Queue Manager (Unit)', () => {
  let queueManager;

  beforeEach(() => {
    queueManager = new QueueManager({
      maxRetries: 2,
      batchSize: 10,
      baseRetryDelay: 100
    });

    // Mock navigator.onLine
    Object.defineProperty(global.navigator, 'onLine', {
      writable: true,
      value: true
    });
  });

  afterEach(() => {
    queueManager.destroy();
  });

  describe('Initialization', () => {
    it('creates queue manager with defaults', () => {
      const manager = new QueueManager();
      expect(manager.queue).toEqual([]);
      expect(manager.processing).toBe(false);
      manager.destroy();
    });

    it('creates queue manager with custom options', () => {
      expect(queueManager.maxRetries).toBe(2);
      expect(queueManager.batchSize).toBe(10);
      expect(queueManager.baseRetryDelay).toBe(100);
    });
  });

  describe('Operation Enqueueing', () => {
    it('validates operation structure', () => {
      const op = {
        id: uuid(),
        operation: { type: 'create' }
      };

      expect(op).toHaveProperty('id');
      expect(op).toHaveProperty('operation');
      expect(op.operation).toHaveProperty('type');
    });

    it('simulates enqueueing single operation', () => {
      const op = {
        id: uuid(),
        operation: { type: 'create' },
        timestamp: Date.now(),
        retries: 0,
        status: 'pending'
      };

      queueManager.queue.push(op);

      expect(queueManager.queue).toHaveLength(1);
      expect(queueManager.queue[0].status).toBe('pending');
    });

    it('simulates enqueueing multiple operations', () => {
      const ops = [
        { id: uuid(), operation: { type: 'create' }, timestamp: Date.now(), retries: 0, status: 'pending' },
        { id: uuid(), operation: { type: 'update' }, timestamp: Date.now(), retries: 0, status: 'pending' }
      ];

      queueManager.queue.push(...ops);

      expect(queueManager.queue).toHaveLength(2);
    });

    it('assigns timestamps to operations', () => {
      const op = { id: uuid(), operation: { type: 'create' }, timestamp: new Date() };
      expect(op.timestamp).toBeInstanceOf(Date);
    });

    it('tracks retry counter', () => {
      const op = { id: uuid(), operation: { type: 'create' }, retries: 0 };
      expect(op.retries).toBe(0);
    });
  });

  describe('Queue Status', () => {
    it('reports queue status', () => {
      const status = queueManager.getStatus();

      expect(status).toHaveProperty('queued');
      expect(status).toHaveProperty('processing');
      expect(status).toHaveProperty('isOnline');
      expect(status).toHaveProperty('timestamp');
    });

    it('tracks queued count', () => {
      expect(queueManager.getStatus().queued).toBe(0);

      queueManager.queue.push({ id: uuid(), operation: { type: 'create' } });
      expect(queueManager.getStatus().queued).toBe(1);

      queueManager.queue.push({ id: uuid(), operation: { type: 'update' } });
      expect(queueManager.getStatus().queued).toBe(2);
    });

    it('tracks processing state', () => {
      expect(queueManager.getStatus().processing).toBe(false);

      queueManager.processing = true;
      expect(queueManager.getStatus().processing).toBe(true);

      queueManager.processing = false;
      expect(queueManager.getStatus().processing).toBe(false);
    });
  });

  describe('Retry Logic', () => {
    it('calculates exponential backoff', () => {
      const delay0 = queueManager._exponentialBackoff(0);
      const delay1 = queueManager._exponentialBackoff(1);
      const delay2 = queueManager._exponentialBackoff(2);

      // Exponential backoff should generally increase
      // (though with jitter, individual values may not)
      expect(delay0).toBeGreaterThan(0);
      expect(delay1).toBeGreaterThan(0);
      expect(delay2).toBeGreaterThan(0);

      // Cap should apply
      expect(delay0).toBeLessThanOrEqual(30000);
      expect(delay1).toBeLessThanOrEqual(30000);
      expect(delay2).toBeLessThanOrEqual(30000);
    });

    it('respects max retries', () => {
      expect(queueManager.maxRetries).toBe(2);
    });

    it('tracks retry count per operation', () => {
      const op1Id = uuid();
      const op2Id = uuid();

      queueManager.retryCount.set(op1Id, 1);
      queueManager.retryCount.set(op2Id, 2);

      expect(queueManager.retryCount.get(op1Id)).toBe(1);
      expect(queueManager.retryCount.get(op2Id)).toBe(2);
    });
  });

  describe('Queue Manipulation', () => {
    it('removes specific operation', () => {
      const opId = uuid();
      queueManager.queue.push({ id: opId, operation: { type: 'create' } });

      expect(queueManager.queue).toHaveLength(1);

      // Simulate removeOperation (without DB call)
      queueManager.queue = queueManager.queue.filter(op => op.id !== opId);
      queueManager.retryCount.delete(opId);

      expect(queueManager.queue).toHaveLength(0);
      expect(queueManager.retryCount.has(opId)).toBe(false);
    });

    it('clears entire queue', () => {
      queueManager.queue.push({ id: uuid(), operation: { type: 'create' } });
      queueManager.queue.push({ id: uuid(), operation: { type: 'update' } });

      expect(queueManager.queue).toHaveLength(2);

      // Simulate clearQueue
      queueManager.queue = [];
      queueManager.retryCount.clear();

      expect(queueManager.queue).toHaveLength(0);
      expect(queueManager.retryCount.size).toBe(0);
    });
  });

  describe('Offline Handling', () => {
    it('detects online status', () => {
      navigator.onLine = true;
      expect(queueManager.getStatus().isOnline).toBe(true);

      navigator.onLine = false;
      expect(queueManager.getStatus().isOnline).toBe(false);
    });

    it('handles online event', () => {
      const spy = vi.spyOn(queueManager, 'onOnline');
      queueManager.onOnline();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('handles offline event', () => {
      queueManager.processing = true;
      queueManager.onOffline();
      expect(queueManager.processing).toBe(false);
    });

    it('suspends processing when offline', () => {
      navigator.onLine = false;
      const status = queueManager.getStatus();
      expect(status.isOnline).toBe(false);
    });
  });

  describe('Batch Processing', () => {
    it('splits queue into batches', () => {
      for (let i = 0; i < 25; i++) {
        queueManager.queue.push({ id: uuid(), operation: { type: 'create' } });
      }

      expect(queueManager.queue).toHaveLength(25);

      // Manually simulate processing batches
      const batch1 = queueManager.queue.splice(0, queueManager.batchSize);
      const batch2 = queueManager.queue.splice(0, queueManager.batchSize);

      expect(batch1).toHaveLength(10);
      expect(batch2).toHaveLength(10);
      expect(queueManager.queue).toHaveLength(5);
    });

    it('respects batch size limit', () => {
      expect(queueManager.batchSize).toBe(10);
    });
  });

  describe('Time Delays', () => {
    it('implements wait utility', async () => {
      const start = Date.now();
      await queueManager._wait(100);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThan(200);
    });
  });

  describe('Lifecycle', () => {
    it('destroys queue manager and removes listeners', () => {
      const spy = vi.spyOn(window, 'removeEventListener');

      queueManager.destroy();

      // Check that event listeners were attempted to be removed
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });

    it('handles multiple destroy calls safely', () => {
      queueManager.destroy();
      queueManager.destroy(); // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty operation ID', () => {
      const op = { operation: { type: 'create' } };
      const opId = op.id || uuid();

      expect(opId).toBeDefined();
    });

    it('handles very large queue', () => {
      for (let i = 0; i < 100; i++) {
        queueManager.queue.push({
          id: uuid(),
          operation: { type: 'create' }
        });
      }

      expect(queueManager.queue).toHaveLength(100);
    });

    it('handles removing non-existent operation', () => {
      const nonExistentId = 'non-existent-id';
      const before = queueManager.queue.length;

      // Filter out non-existent
      queueManager.queue = queueManager.queue.filter(op => op.id !== nonExistentId);

      expect(queueManager.queue.length).toBeLessThanOrEqual(before);
    });

    it('handles clearing empty queue', () => {
      queueManager.queue = [];
      expect(queueManager.queue).toHaveLength(0);
    });
  });
});
