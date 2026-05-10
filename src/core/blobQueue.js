/**
 * Use IndexedDB nativo para armazenar Blobs sem inflação de base64.
 * Não converter para DataURL antes de put.
 * Fallback em memória ativo quando IndexedDB indisponível (jsdom, edge browsers).
 * Pendências NÃO sobrevivem reload nesse modo. Em produção, IndexedDB é o caminho normal.
 */

const DB_NAME = 'cooltrack-blob-queue';
const STORE_NAME = 'photo-pending';
const DB_VERSION = 1;
const HAS_INDEXED_DB = typeof indexedDB !== 'undefined';
const memoryQueue = new Map();

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('blobQueue open failed'));
  });
}

export async function enqueueBlob(key, blob, metadata = {}) {
  if (!HAS_INDEXED_DB) {
    memoryQueue.set(key, { key, blob, metadata });
    return;
  }
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ key, blob, metadata });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('blobQueue put failed'));
  });
  db.close();
}

export async function getBlobEntry(key) {
  if (!HAS_INDEXED_DB) {
    return memoryQueue.get(key) || null;
  }
  const db = await openDb();
  const out = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error || new Error('blobQueue get failed'));
  });
  db.close();
  return out;
}

export async function removeBlob(key) {
  if (!HAS_INDEXED_DB) {
    memoryQueue.delete(key);
    return;
  }
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('blobQueue delete failed'));
  });
  db.close();
}

export async function listBlobs() {
  if (!HAS_INDEXED_DB) {
    return Array.from(memoryQueue.values());
  }
  const db = await openDb();
  const rows = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
    req.onerror = () => reject(req.error || new Error('blobQueue list failed'));
  });
  db.close();
  return rows;
}

export async function clearBlobQueue() {
  memoryQueue.clear();
  if (!HAS_INDEXED_DB) return;

  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('blobQueue clear failed'));
  });
  db.close();
}
