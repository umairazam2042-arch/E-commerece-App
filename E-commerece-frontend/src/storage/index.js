import { uploadApi } from '../api/uploadApi';
import { uploadToImageKit } from './providers/imagekitUploader';

// Naya provider register karne ke liye yahan ek line add karein
const UPLOADERS = {
  imagekit: uploadToImageKit,
};

export const MAX_IMAGE_MB = 5;
export const ACCEPT_IMAGES = 'image/jpeg,image/png,image/webp';
const ALLOWED_TYPES = ACCEPT_IMAGES.split(',');

// Ye function UI ko sirf ek URL deta hai, provider kaun sa hai ye us ko nahi pata
export const uploadImage = async (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Sirf JPG, PNG ya WEBP image upload karein');
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    throw new Error(`Image ${MAX_IMAGE_MB} MB se chhoti honi chahiye`);
  }

  const auth = await uploadApi.auth();
  const uploader = UPLOADERS[auth.provider];
  if (!uploader) {
    throw new Error(`Storage provider "${auth.provider}" frontend par set nahi hai`);
  }

  return uploader(file, auth);
};