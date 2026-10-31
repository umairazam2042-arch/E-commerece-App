const IORedis = require('ioredis');

// Cache ke liye alag connection. Offline queue band hai, taake Redis down ho to request atak na jaye.
const cacheClient = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, { enableOfflineQueue: false, maxRetriesPerRequest: 1 })
  : null;

if (cacheClient) {
  cacheClient.on('error', () => {}); // cache optional hai, errors ko chupa dein
}

const DEFAULT_TTL = 60; // seconds

const cacheGet = async (key) => {
  if (!cacheClient) return null;
  try {
    const raw = await cacheClient.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const cacheSet = async (key, value, ttl = DEFAULT_TTL) => {
  if (!cacheClient) return;
  try {
    await cacheClient.set(key, JSON.stringify(value), 'EX', ttl);
  } catch {
    // set fail ho to koi masla nahi
  }
};

const getVersion = async (ns) => {
  if (!cacheClient) return 0;
  try {
    return Number(await cacheClient.get(`ver:${ns}`)) || 0;
  } catch {
    return 0;
  }
};

// Version barhane se purane cache keys bekar ho jate hain (expire ho jate hain)
const bumpVersion = async (ns) => {
  if (!cacheClient) return;
  try {
    await cacheClient.incr(`ver:${ns}`);
  } catch {
    // ignore
  }
};

const buildKey = (ns, version, params) => `${ns}:v${version}:${JSON.stringify(params)}`;

module.exports = { cacheGet, cacheSet, getVersion, bumpVersion, buildKey };