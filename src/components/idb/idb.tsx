import { CaseEntity } from "@/types/case";
import { IDBPDatabase, openDB } from "idb";

const DB_NAME = import.meta.env.VITE_DB_NAME || "CMS";
const KV_STORE = "KeyValueStore";
const MIN_VERSION = 1; // Always start at version 1

const createdStores = new Set<string>();
const storeCache = new Map<string, any>();
const storeCreationPromises = new Map<string, Promise<any>>();
let currentDbVersion: number | undefined;
let dbInstance: IDBPDatabase | null = null;

export interface IndexConfig {
    name: string;
    keyPath: string | string[];
    unique?: boolean;
    multiEntry?: boolean;
}

export interface StoreConfig {
    primaryKey?: string | string[];
    autoIncrement?: boolean;
    indexes?: IndexConfig[];
}

export type Repository<T> = ReturnType<typeof createRepository<T>>;

/**
 * Get current database version
 */
async function getCurrentVersion(): Promise<number> {
    if (currentDbVersion !== undefined) {
        return currentDbVersion;
    }

    try {

        const db = await openDB(DB_NAME, MIN_VERSION, {
            upgrade(db, oldVersion) {
                if (oldVersion < 1 && !db.objectStoreNames.contains(KV_STORE)) {
                    db.createObjectStore(KV_STORE);
                    console.log(`✅ Created ${KV_STORE} store`);
                }
            },
        });
        currentDbVersion = db.version;
        db.close();
        return currentDbVersion;
    } catch (error) {
        console.error("Failed to get current version:", error);
        throw error;
    }
}


async function getDB(): Promise<IDBPDatabase> {
    if (dbInstance && dbInstance.version === currentDbVersion) {
        return dbInstance;
    }

    const version = await getCurrentVersion();
    
    dbInstance = await openDB(DB_NAME, version, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(KV_STORE)) {
                db.createObjectStore(KV_STORE);
                console.log(`✅ Created ${KV_STORE} store during upgrade`);
            }
        },
    });

    return dbInstance;
}


export async function createStore<T>(
    storeName: string,
    config: StoreConfig = {}
): Promise<Repository<T>> {

    if (storeCreationPromises.has(storeName)) {
        return storeCreationPromises.get(storeName)!;
    }

    const creationPromise = (async () => {
        try {
            const version = await getCurrentVersion();
            
            if (dbInstance) {
                dbInstance.close();
                dbInstance = null;
            }

            const checkDb = await openDB(DB_NAME, version);

            if (checkDb.objectStoreNames.contains(storeName)) {
                console.log(`Store '${storeName}' already exists — clearing existing data...`);
                const tx = checkDb.transaction(storeName, "readwrite");
                await tx.store.clear();
                await tx.done;

                const repo = createRepository<T>(checkDb, storeName);
                storeCache.set(storeName, repo);
                dbInstance = checkDb;
                return repo;
            }
            
            checkDb.close();

            const { primaryKey = "id", autoIncrement = false, indexes = [] } = config;
            createdStores.add(storeName);

            const newVersion = version + 1;
            currentDbVersion = newVersion;

            const db = await openDB(DB_NAME, newVersion, {
                upgrade(db) {

                    if (!db.objectStoreNames.contains(KV_STORE)) {
                        db.createObjectStore(KV_STORE);
                        console.log(`✅ Created ${KV_STORE} store during upgrade`);
                    }

                    if (!db.objectStoreNames.contains(storeName)) {
                        const objectStore = db.createObjectStore(storeName, {
                            keyPath: primaryKey,
                            autoIncrement,
                        });

                        indexes.forEach((index) => {
                            objectStore.createIndex(index.name, index.keyPath, {
                                unique: index.unique || false,
                                multiEntry: index.multiEntry || false,
                            });
                        });

                        console.log(`✅ Store '${storeName}' created with ${indexes.length} indexes`);
                    }
                },
            });

            dbInstance = db; // Cache the new instance
            const repository = createRepository<T>(db, storeName);
            storeCache.set(storeName, repository);
            return repository;
        } catch (error) {
            console.error(`❌ Failed to create store '${storeName}':`, error);
            throw error;
        }
    })();

    storeCreationPromises.set(storeName, creationPromise);

    try {
        return await creationPromise;
    } finally {
        storeCreationPromises.delete(storeName);
    }
}

/**
 * Get existing store
 */
export async function getStore<T>(storeName: string): Promise<Repository<T>> {
    try {
        const db = await getDB();

        if (!db.objectStoreNames.contains(storeName)) {
            throw new Error(`Store '${storeName}' does not exist. Use createStore() first.`);
        }

        // Return cached or create new
        if (storeCache.has(storeName)) {
            return storeCache.get(storeName);
        }

        const repository = createRepository<T>(db, storeName);
        storeCache.set(storeName, repository);
        return repository;
    } catch (error) {
        console.error(`❌ Failed to get store '${storeName}':`, error);
        throw error;
    }
}

/**
 * Create repository with CRUD operations
 */
function createRepository<T>(db: IDBPDatabase, storeName: string) {
    return {
        async add(data: T): Promise<IDBValidKey> {
            try {
                return await db.add(storeName, data);
            } catch (error: any) {
                if (error?.name === 'ConstraintError') {
                    throw new Error(`Duplicate key in '${storeName}'`);
                }
                throw error;
            }
        },

        async addBulk(items: T[]): Promise<IDBValidKey[]> {
            const tx = db.transaction(storeName, "readwrite");
            const promises = items.map((item) => tx.store.add(item));
            await tx.done;
            return Promise.all(promises);
        },

        async get(key: IDBValidKey): Promise<T | undefined> {
            return db.get(storeName, key);
        },

        async getAll(): Promise<T[]> {
            return db.getAll(storeName);
        },

        async getByIndex(indexName: string, value: IDBValidKey): Promise<T[]> {
            return db.getAllFromIndex(storeName, indexName, value);
        },

        async getOneByIndex(indexName: string, value: IDBValidKey): Promise<T | undefined> {
            return db.getFromIndex(storeName, indexName, value);
        },

        async update(data: T): Promise<IDBValidKey> {
            return db.put(storeName, data);
        },

        async updateBulk(items: T[]): Promise<IDBValidKey[]> {
            const tx = db.transaction(storeName, "readwrite");
            const promises = items.map((item) => tx.store.put(item));
            await tx.done;
            return Promise.all(promises);
        },

        async delete(key: IDBValidKey): Promise<void> {
            return db.delete(storeName, key);
        },

        async clear(): Promise<void> {
            return db.clear(storeName);
        },

        async count(): Promise<number> {
            return db.count(storeName);
        },

        async countByIndex(indexName: string, value?: IDBValidKey): Promise<number> {
            return db.countFromIndex(storeName, indexName, value);
        },

        async has(key: IDBValidKey): Promise<boolean> {
            const result = await db.getKey(storeName, key);
            return !!result;
        },

        async getAllKeys(): Promise<IDBValidKey[]> {
            return db.getAllKeys(storeName);
        },

        getDB: () => db,
        getStoreName: () => storeName,
    };
}

/**
 * LocalStorage-like API using IndexedDB
 */
export const idbStorage = {
    async setItem(key: string, value: any) {
        const db = await getDB();
        const storedValue = typeof value === "string" ? value : JSON.stringify(value);
        await db.put(KV_STORE, storedValue, key);
    },

    async getItem<T = any>(key: string): Promise<T | null> {
        const db = await getDB();
        const value = await db.get(KV_STORE, key);
        if (value === undefined) return null;
        try {
            return JSON.parse(value);
        } catch {
            return value ?? null;
        }
    },

    async removeItem(key: string) {
        const db = await getDB();
        await db.delete(KV_STORE, key);
    },

    async clear() {
        const db = await getDB();
        await db.clear(KV_STORE);
    },

    async keys() {
        const db = await getDB();
        return db.getAllKeys(KV_STORE);
    },
};

export async function setUpIndexDb() {
    await createStore<CaseEntity>("caseList", {
        primaryKey: "caseId",
        indexes: [
            { name: "orgId", keyPath: "orgId", unique: false },
            { name: "createdDate", keyPath: "createdDate", unique: false },
        ],
    });
}