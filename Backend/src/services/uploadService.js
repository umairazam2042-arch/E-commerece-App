const storage = require('../storage');

// Frontend ko provider ka naam aur upload token dono milte hain
const getUploadAuth = () => ({
  provider: storage.providerName,
  ...storage.getUploadAuth(),
});

module.exports = { getUploadAuth };