const mongoose = require('mongoose');

function getBucket() {
  if (!mongoose.connection || !mongoose.connection.db) {
    throw new Error('MongoDB no está conectado');
  }

  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads',
  });
}

async function uploadBase64(base64, filename, contentType) {
  const bucket = getBucket();

  let base64Data = base64;
  if (base64.includes(',')) base64Data = base64.split(',')[1];

  const buffer = Buffer.from(base64Data, 'base64');

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename || 'file', {
      contentType: contentType || 'application/octet-stream',
    });

    uploadStream.on('finish', () => resolve(uploadStream.id));

    uploadStream.end(buffer);
    uploadStream.on('error', err => reject(err));
  });
}

module.exports = {
  uploadBase64,
  getBucket,
};
