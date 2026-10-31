const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Har test aur hook ke liye lamba time
jest.setTimeout(180000);

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create({ instance: { launchTimeout: 120000 } });
  await mongoose.connect(mongod.getUri());

  // Indexes (text index search ke liye zaroori) pehle se bana dein
  await Promise.all(Object.values(mongoose.models).map((m) => m.createIndexes()));
}, 180000);

// Har test ke baad data saaf karein
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}, 60000);