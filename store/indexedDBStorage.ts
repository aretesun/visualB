import { StateStorage } from 'zustand/middleware';

const DB_NAME = 'vision-board-db';
const STORE_NAME = 'key-value-store';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

async function getFromDB(key: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function saveToDB(key: string, value: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function removeFromDB(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await getFromDB(name);

      if (value !== null) {
        return value;
      }

      const localValue = localStorage.getItem(name);
      if (localValue) {
        console.log(`📦 Migrating ${name} from localStorage to IndexedDB...`);
        await saveToDB(name, localValue);
        localStorage.removeItem(name);
        console.log(`✅ Migration complete for ${name}`);
        return localValue;
      }

      return null;
    } catch (error) {
      console.error('Error getting item from IndexedDB:', error);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await saveToDB(name, value);
    } catch (error) {
      console.error('Error setting item to IndexedDB:', error);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await removeFromDB(name);
    } catch (error) {
      console.error('Error removing item from IndexedDB:', error);
    }
  },
};
