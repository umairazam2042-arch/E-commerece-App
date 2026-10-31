// Yahan naya provider register karein. Baaqi app ko sirf is file ka interface pata hai.
const PROVIDERS = {
  imagekit: require('./providers/imagekit'),
};

const providerKey = process.env.STORAGE_PROVIDER || 'imagekit';
const provider = PROVIDERS[providerKey];

if (!provider) {
  throw new Error(`STORAGE_PROVIDER "${providerKey}" maujood nahi hai`);
}

module.exports = {
  providerName: provider.name,
  getUploadAuth: () => provider.getUploadAuth(),
};