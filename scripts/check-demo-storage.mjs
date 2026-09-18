import assert from "node:assert/strict";
import {
  STORAGE_SCHEMA_VERSION,
  createDemoStorage,
  makeDomainStorageKey,
  makeGlobalStorageKey,
} from "../src/core/demoStorage.js";
import { logAudit } from "../src/user/auditLog.js";

const values = new Map();
const memoryStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
};
const storage = createDemoStorage(() => memoryStorage);
globalThis.localStorage = memoryStorage;

assert.equal(STORAGE_SCHEMA_VERSION, 1);
assert.equal(makeGlobalStorageKey("uiPrefs"), "roadq.uiPrefs");
assert.equal(makeDomainStorageKey("audit", "expressway"), "roadq.audit.expressway");

assert.equal(storage.readText("missing", "fallback"), "fallback");
assert.equal(storage.writeText("text", "value"), true);
assert.equal(storage.readText("text"), "value");

assert.equal(storage.writeJson("json", { ok: true }), true);
assert.deepEqual(storage.readJson("json", {}), { ok: true });
values.set("broken", "{not-json");
assert.deepEqual(storage.readJson("broken", []), []);

assert.equal(storage.writeText("secret", "classified", { sensitive: true }), false);
assert.equal(values.has("secret"), false);
assert.equal(storage.writeJson("secret-json", serializationGuard(), { sensitive: true }), false);
assert.equal(values.has("secret-json"), false);
values.set("existing-secret", "classified");
assert.equal(storage.readText("existing-secret", null, { sensitive: true }), null);
assert.equal(storage.remove("existing-secret", { sensitive: true }), false);
assert.equal(values.has("existing-secret"), true);

assert.equal(storage.remove("text"), true);
assert.equal(values.has("text"), false);

values.set("roadq.activeDomain", "expressway");
assert.equal(logAudit({ type: "secure-test" }, { sensitive: true }), false);
assert.equal(values.has("roadq.audit.expressway"), false);
assert.equal(logAudit({ type: "general-test" }), true);
assert.equal(storage.readJson("roadq.audit.expressway", []).length, 1);
storage.remove("roadq.audit.expressway");

const unavailable = createDemoStorage(() => { throw new Error("blocked"); });
assert.equal(unavailable.readText("key", "safe"), "safe");
assert.equal(unavailable.writeText("key", "value"), false);
assert.equal(unavailable.remove("key"), false);

const circular = {};
circular.self = circular;
assert.equal(storage.writeJson("circular", circular), false);

console.log("Demo storage validation passed: compatibility keys, failure recovery, sensitive-data blocking");

function serializationGuard() {
  return { toJSON: () => { throw new Error("sensitive values must not be serialized"); } };
}
