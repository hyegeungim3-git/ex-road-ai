export const STORAGE_NAMESPACE = "roadq";
export const STORAGE_SCHEMA_VERSION = 1;

export const makeGlobalStorageKey = (feature) => `${STORAGE_NAMESPACE}.${feature}`;
export const makeDomainStorageKey = (feature, domainId) => `${makeGlobalStorageKey(feature)}.${domainId}`;

export function createDemoStorage(storageProvider = () => globalThis.localStorage) {
  const getStorage = () => {
    try {
      return storageProvider();
    } catch {
      return null;
    }
  };

  const readText = (key, fallback = null, { sensitive = false } = {}) => {
    if (sensitive) return fallback;

    try {
      const value = getStorage()?.getItem(key);
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  };

  const writeText = (key, value, { sensitive = false } = {}) => {
    if (sensitive) return false;

    try {
      const storage = getStorage();
      if (!storage) return false;
      storage.setItem(key, String(value));
      return true;
    } catch {
      return false;
    }
  };

  const readJson = (key, fallback, options) => {
    const raw = readText(key, null, options);
    if (raw == null) return fallback;

    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  const writeJson = (key, value, options) => {
    if (options?.sensitive) return false;

    try {
      const serialized = JSON.stringify(value);
      if (serialized === undefined) return false;
      return writeText(key, serialized, options);
    } catch {
      return false;
    }
  };

  const remove = (key, { sensitive = false } = {}) => {
    if (sensitive) return false;

    try {
      const storage = getStorage();
      if (!storage) return false;
      storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  };

  return { readText, writeText, readJson, writeJson, remove };
}

export const demoStorage = createDemoStorage();
