const ImageKit = require('imagekit');
const AppError = require('../../utils/AppError');

const { IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT } = process.env;

// ImageKit ke andar files kis folder mein jayengi
const FOLDER = 'multivendor/products';

const client =
  IMAGEKIT_PUBLIC_KEY && IMAGEKIT_PRIVATE_KEY && IMAGEKIT_URL_ENDPOINT
    ? new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_URL_ENDPOINT,
      })
    : null;

// Frontend ko one-time signed token deta hai (file server se nahi guzarti)
const getUploadAuth = () => {
  if (!client) {
    throw new AppError('ImageKit keys .env mein set nahi hain', 500);
  }

  return {
    ...client.getAuthenticationParameters(),
    publicKey: IMAGEKIT_PUBLIC_KEY,
    folder: FOLDER,
  };
};

module.exports = { name: 'imagekit', getUploadAuth };