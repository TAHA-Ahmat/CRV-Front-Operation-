import Dexie, { Table } from 'dexie';

export class CRVDB extends Dexie {
  crvs;
  phases;
  personnel;
  equipment;
  syncQueue;

  constructor() {
    super('crv-db');
    this.version(1).stores({
      crvs: '++id, numero, creePar, statut, vol',
      phases: '++id, crv, numero, statut',
      personnel: '++id, nom, email',
      equipment: '++id, immatriculation, type',
      syncQueue: '++id, timestamp, status, crvId'
    });
  }
}

export const db = new CRVDB();

// Sync operations
export const queueForSync = async (action, data) => {
  return db.syncQueue.add({
    timestamp: Date.now(),
    status: 'pending',
    action,
    data,
  });
};

export const getCRVsOffline = async (userId) => {
  return db.crvs.where('creePar').equals(userId).toArray();
};

export const saveCRVOffline = async (crv) => {
  return db.crvs.put(crv);
};

export const addPhaseOffline = async (crvId, phase) => {
  return db.phases.add({
    crv: crvId,
    ...phase,
  });
};

export const clearSyncQueue = async () => {
  return db.syncQueue.clear();
};

export const getSyncQueue = async () => {
  return db.syncQueue.where('status').equals('pending').toArray();
};

export const markSynced = async (id) => {
  return db.syncQueue.update(id, { status: 'synced' });
};
