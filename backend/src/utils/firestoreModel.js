import { firestore, admin } from '../config/firebase.js';
import crypto from 'node:crypto';

const registry = new Map();

const COLLECTIONS = {
  User: 'users', Market: 'markets', Category: 'categories', Shop: 'shops', Product: 'products',
  Order: 'orders', Review: 'reviews', Conversation: 'conversations', Message: 'messages',
};

const MODEL_BY_COLLECTION = Object.fromEntries(Object.entries(COLLECTIONS).map(([k, v]) => [v, k]));

function idFor(collection, value) {
  if (value) return String(value);
  const prefix = collection.replace(/s$/, '').toLowerCase();
  return `${prefix}_${crypto.randomUUID()}`;
}

function normalizeValue(value) {
  if (value && typeof value.toDate === 'function') return value.toDate();
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (value && typeof value === 'object' && value.constructor === Object) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalizeValue(v)]));
  }
  return value;
}

function getValues(obj, path) {
  const parts = String(path).split('.');
  const walk = (value, index) => {
    if (index >= parts.length) return [value];
    if (Array.isArray(value)) return value.flatMap(v => walk(v, index));
    if (value == null) return [undefined];
    return walk(value[parts[index]], index + 1);
  };
  return walk(obj, 0);
}

function equalValue(actual, expected) {
  if (actual instanceof Date && expected instanceof Date) return actual.getTime() === expected.getTime();
  if (actual === expected) return true;
  if (actual == null || expected == null) return actual == expected;
  if (typeof actual?.toString === 'function' && typeof expected?.toString === 'function') return actual.toString() === expected.toString();
  return false;
}

function conditionMatches(values, condition) {
  if (condition instanceof RegExp) return values.some(v => condition.test(String(v ?? '')));
  if (condition && typeof condition === 'object' && !Array.isArray(condition) && !(condition instanceof Date)) {
    if ('$in' in condition) return values.some(v => condition.$in.some(x => Array.isArray(v) ? v.some(a => equalValue(a, x)) : equalValue(v, x)));
    if ('$nin' in condition) return values.every(v => !condition.$nin.some(x => equalValue(v, x)));
    if ('$ne' in condition) return values.every(v => !equalValue(v, condition.$ne));
    if ('$exists' in condition) return condition.$exists ? values.some(v => v !== undefined) : values.every(v => v === undefined);
    if ('$elemMatch' in condition) return values.some(v => Array.isArray(v) && v.some(item => matches(item, condition.$elemMatch)));
    return values.some(v => equalValue(v, condition));
  }
  return values.some(v => Array.isArray(v) ? v.some(a => equalValue(a, condition)) : equalValue(v, condition));
}

function matches(doc, filter = {}) {
  if (!filter || !Object.keys(filter).length) return true;
  if (filter.$or && !filter.$or.some(f => matches(doc, f))) return false;
  if (filter.$and && !filter.$and.every(f => matches(doc, f))) return false;
  if (filter.$nor && filter.$nor.some(f => matches(doc, f))) return false;
  for (const [key, condition] of Object.entries(filter)) {
    if (key.startsWith('$')) continue;
    if (key === '$text') {
      const q = String(condition?.$search || '').toLowerCase();
      const haystack = Object.values(doc).map(v => typeof v === 'string' ? v : '').join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
      continue;
    }
    if (!conditionMatches(getValues(doc, key), condition)) return false;
  }
  return true;
}

function setPath(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    current[parts[i]] ??= {};
    current = current[parts[i]];
  }
  current[parts.at(-1)] = value;
}

function project(doc, fields) {
  if (!fields) return doc;
  const fieldList = String(fields).trim().split(/\s+/).filter(Boolean);
  const excludes = fieldList.filter(f => f.startsWith('-')).map(f => f.slice(1));
  const includes = fieldList.filter(f => !f.startsWith('-'));
  if (includes.length) {
    const out = { _id: doc._id };
    for (const f of includes) if (getValues(doc, f)[0] !== undefined) setPath(out, f, getValues(doc, f)[0]);
    return out;
  }
  const out = structuredClone(doc);
  for (const f of excludes) {
    const parts = f.split('.');
    let cur = out;
    for (let i = 0; i < parts.length - 1; i++) cur = cur?.[parts[i]];
    if (cur) delete cur[parts.at(-1)];
  }
  return out;
}

function attachMethods(raw, collection) {
  const doc = raw;
  Object.defineProperty(doc, 'save', { enumerable: false, value: async function save() {
    const now = new Date();
    doc.updatedAt = now;
    await firestore().collection(collection).doc(doc._id).set(stripFirestoreValues(doc), { merge: false });
    return doc;
  }});
  Object.defineProperty(doc, 'deleteOne', { enumerable: false, value: async function deleteOne() {
    await firestore().collection(collection).doc(doc._id).delete();
    return { acknowledged: true, deletedCount: 1 };
  }});
  Object.defineProperty(doc, 'populate', { enumerable: false, value: async function populate(path) {
    await populateDocument(doc, path);
    return doc;
  }});
  Object.defineProperty(doc, 'toObject', { enumerable: false, value: function toObject() { return structuredClone(doc); } });
  return doc;
}

function stripFirestoreValues(value) {
  if (value === undefined) return undefined;
  if (value instanceof Date) return admin.firestore.Timestamp.fromDate(value);
  if (Array.isArray(value)) return value.map(stripFirestoreValues);
  if (value && typeof value === 'object' && value.constructor === Object) {
    return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined).map(([k, v]) => [k, stripFirestoreValues(v)]));
  }
  return value;
}

async function allDocs(collection) {
  const snap = await firestore().collection(collection).get();
  return snap.docs.map(d => attachMethods({ _id: d.id, ...normalizeValue(d.data()) }, collection));
}

// findById() and any filter keyed on a plain `_id` equality (or `_id: {$in:
// [...]}`) is the hot path here — it runs on every authenticated request via
// the auth middleware, and throughout every controller. Scanning and reading
// every document in the collection just to resolve one or a few ids is a
// real Firestore cost/latency problem (full collection read billed on every
// call, and it only gets slower as a collection grows). Resolve those cases
// with direct document reads instead; everything else keeps the original
// collection-scan behavior since the in-memory query layer needs to support
// arbitrary Mongo-style filters.
async function docsForFilter(collection, filter) {
  const idCondition = filter && Object.prototype.hasOwnProperty.call(filter, '_id') ? filter._id : undefined;

  if (typeof idCondition === 'string') {
    const snap = await firestore().collection(collection).doc(idCondition).get();
    if (!snap.exists) return [];
    return [attachMethods({ _id: snap.id, ...normalizeValue(snap.data()) }, collection)];
  }

  if (idCondition && typeof idCondition === 'object' && Array.isArray(idCondition.$in)) {
    const ids = [...new Set(idCondition.$in.map(String))];
    const snaps = await Promise.all(ids.map(id => firestore().collection(collection).doc(id).get()));
    return snaps.filter(s => s.exists).map(s => attachMethods({ _id: s.id, ...normalizeValue(s.data()) }, collection));
  }

  return allDocs(collection);
}

function modelForPath(path) {
  const base = String(path).split('.')[0];
  const map = {
    buyerId: 'User', sellerId: 'User', ownerId: 'User', senderId: 'User',
    shopId: 'Shop', productId: 'Product', marketId: 'Market', categoryIds: 'Category',
    conversationId: 'Conversation', items: null,
  };
  return map[base];
}

async function fetchRef(modelName, id) {
  if (!modelName || !id) return null;
  const collection = COLLECTIONS[modelName];
  if (!collection) return null;
  const snap = await firestore().collection(collection).doc(String(id)).get();
  return snap.exists ? attachMethods({ _id: snap.id, ...normalizeValue(snap.data()) }, collection) : null;
}

async function populateDocument(doc, spec) {
  const path = typeof spec === 'string' ? spec : spec?.path;
  if (!path) return;
  if (path.startsWith('items.')) {
    const nested = path.split('.')[1];
    const modelName = modelForPath(nested);
    if (!modelName || !Array.isArray(doc.items)) return;
    for (const item of doc.items) {
      const id = item[nested];
      if (id) item[nested] = await fetchRef(modelName, id);
    }
    return;
  }
  const modelName = modelForPath(path);
  const id = doc[path];
  if (!modelName || !id) return;
  if (Array.isArray(id)) doc[path] = await Promise.all(id.map(v => fetchRef(modelName, v)));
  else doc[path] = await fetchRef(modelName, id);
}

class Query {
  constructor(collection, filter, single = false) {
    this.collection = collection; this.filter = filter; this.single = single;
    this.sortSpec = null; this.limitN = null; this.selectSpec = null; this.populateSpecs = [];
  }
  sort(spec) { this.sortSpec = spec; return this; }
  limit(n) { this.limitN = Number(n); return this; }
  select(spec) { this.selectSpec = spec; return this; }
  lean() { return this; }
  populate(pathOrSpec, select) { this.populateSpecs.push({ path: typeof pathOrSpec === 'string' ? pathOrSpec : pathOrSpec?.path, select }); return this; }
  async exec() {
    let docs = (await docsForFilter(this.collection, this.filter)).filter(d => matches(d, this.filter));
    if (this.sortSpec) {
      const entries = Object.entries(this.sortSpec);
      docs.sort((a, b) => {
        for (const [field, dir] of entries) {
          const av = getValues(a, field)[0]; const bv = getValues(b, field)[0];
          if (equalValue(av, bv)) continue;
          return (av > bv ? 1 : -1) * (dir < 0 ? -1 : 1);
        }
        return 0;
      });
    }
    if (this.limitN != null) docs = docs.slice(0, this.limitN);
    if (this.single) docs = docs.slice(0, 1);
    const output = this.single ? (docs[0] || null) : docs;
    const list = this.single ? (output ? [output] : []) : output;
    for (const doc of list) {
      for (const spec of this.populateSpecs) await populateDocument(doc, spec);
      if (this.selectSpec) {
        const projected = project(doc, this.selectSpec);
        Object.keys(doc).forEach(k => { if (!(k in projected) && k !== '_id') delete doc[k]; });
        Object.assign(doc, projected);
      }
    }
    return output;
  }
  then(resolve, reject) { return this.exec().then(resolve, reject); }
  catch(reject) { return this.exec().catch(reject); }
}

export function createModel(name, collection = COLLECTIONS[name]) {
  if (!collection) throw new Error(`Unknown Firestore collection for ${name}`);
  const Model = {
    modelName: name,
    collection,
    find(filter = {}) { return new Query(collection, filter); },
    findOne(filter = {}) { return new Query(collection, filter, true); },
    findById(id) { return new Query(collection, { _id: String(id) }, true); },
    async create(input) {
      if (Array.isArray(input)) return Promise.all(input.map(v => Model.create(v)));
      const now = new Date();
      const doc = attachMethods({ ...structuredClone(input), _id: idFor(collection, input?._id), createdAt: input?.createdAt || now, updatedAt: input?.updatedAt || now }, collection);
      await firestore().collection(collection).doc(doc._id).set(stripFirestoreValues(doc));
      return doc;
    },
    async exists(filter = {}) { return Boolean(await new Query(collection, filter, true).exec()); },
    async countDocuments(filter = {}) { return (await new Query(collection, filter).exec()).length; },
    async findByIdAndDelete(id) { const doc = await Model.findById(id); if (!doc) return null; await doc.deleteOne(); return doc; },
    async findByIdAndUpdate(id, update = {}, options = {}) {
      const doc = await Model.findById(id); if (!doc) return null;
      Object.assign(doc, update); await doc.save(); return options.new === false ? null : doc;
    },
    async deleteMany(filter = {}) { const docs = await Model.find(filter); await Promise.all(docs.map(d => d.deleteOne())); return { deletedCount: docs.length }; },
    async aggregate(pipeline = []) {
      let docs = await Model.find();
      for (const stage of pipeline) {
        if (stage.$match) docs = docs.filter(d => matches(d, stage.$match));
        if (stage.$group) {
          const spec = stage.$group; const avgField = Object.entries(spec).find(([, v]) => v?.$avg)?.[1]?.$avg;
          const sumField = Object.entries(spec).find(([, v]) => v?.$sum)?.[1]?.$sum;
          const count = docs.length;
          const out = { _id: null };
          for (const [key, value] of Object.entries(spec)) {
            if (key === '_id') continue;
            if (value?.$avg) out[key] = count ? docs.reduce((s, d) => s + Number(getValues(d, value.$avg)[0] || 0), 0) / count : 0;
            if (value?.$sum === 1) out[key] = count;
          }
          docs = [out];
        }
      }
      return docs;
    },
  };
  registry.set(name, Model);
  return Model;
}
