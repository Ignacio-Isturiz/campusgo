const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadBase64ToCloudinary(base64, filename) {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary no configurado');
  }

  let data = base64;
  if (!base64.startsWith('data:')) {
    // default to jpeg if no mime provided
    data = `data:image/jpeg;base64,${base64}`;
  }

  const publicId = filename
    ? `${path.parse(filename).name}_${Date.now()}`
    : `upload_${Date.now()}`;

  const res = await cloudinary.uploader.upload(data, {
    public_id: publicId,
    resource_type: 'image',
    folder: process.env.CLOUDINARY_FOLDER || undefined,
  });

  return {
    url: res.secure_url,
    public_id: res.public_id,
  };
}

module.exports = {
  uploadBase64ToCloudinary,
};
