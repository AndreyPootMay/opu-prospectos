import { openDB } from 'idb';

const DB_NAME = 'opu-prospectos';
const DB_VERSION = 1;

const STORES = {
  PROSPECTS: 'prospects',
};

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORES.PROSPECTS)) {
          const store = db.createObjectStore(STORES.PROSPECTS, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('synced', 'synced');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveProspect(prospect) {
  const db = await getDB();
  const data = {
    ...prospect,
    createdAt: prospect.createdAt || Date.now(),
    updatedAt: Date.now(),
    synced: false,
  };
  const id = await db.put(STORES.PROSPECTS, data);
  return { ...data, id };
}

export async function updateProspect(id, updates) {
  const db = await getDB();
  const existing = await db.get(STORES.PROSPECTS, id);
  if (!existing) throw new Error('Prospecto no encontrado');
  const updated = { ...existing, ...updates, updatedAt: Date.now() };
  await db.put(STORES.PROSPECTS, updated);
  return updated;
}

export async function getProspect(id) {
  const db = await getDB();
  return db.get(STORES.PROSPECTS, id);
}

export async function getAllProspects() {
  const db = await getDB();
  return db.getAllFromIndex(STORES.PROSPECTS, 'createdAt');
}

export async function getPendingProspects() {
  const db = await getDB();
  const all = await db.getAll(STORES.PROSPECTS);
  return all.filter(p => !p.synced);
}

export async function markAsSynced(id) {
  const db = await getDB();
  const existing = await db.get(STORES.PROSPECTS, id);
  if (existing) {
    await db.put(STORES.PROSPECTS, { ...existing, synced: true, syncedAt: Date.now() });
  }
}

export async function deleteProspect(id) {
  const db = await getDB();
  await db.delete(STORES.PROSPECTS, id);
}

export async function clearAllProspects() {
  const db = await getDB();
  await db.clear(STORES.PROSPECTS);
}
