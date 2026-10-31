// Sirf ImageKit ka upload code. Dusre provider ke liye aisa hi ek nayi file banayein.
export const uploadToImageKit = async (file, auth) => {
  const form = new FormData();
  form.append('file', file);
  form.append('fileName', `${Date.now()}-${file.name}`);
  form.append('folder', auth.folder);
  form.append('publicKey', auth.publicKey);
  form.append('token', auth.token);
  form.append('signature', auth.signature);
  form.append('expire', String(auth.expire));

  const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    body: form,
  });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || 'Image upload nahi ho saki');
  }
  return json.url;
};