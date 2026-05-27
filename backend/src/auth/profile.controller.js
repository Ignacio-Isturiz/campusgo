const User = require('../models/User');
const fs = require('fs');
const path = require('path');

async function getProfile(req, res) {
  const user = await User.findById(req.user._id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  // return sanitized payload
  return res.json({ user: {
    id: String(user._id),
    email: user.email,
    role: user.role,
    photoUrl: user.photoUrl || null,
    phone: user.phone || null,
    displayName: user.displayName || null,
  } });
}

async function updateProfile(req, res) {
  try {
    const { displayName, phone } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (typeof displayName === 'string') user.displayName = displayName;
    if (typeof phone === 'string') user.phone = phone;

    await user.save();

    return res.json({ message: 'Perfil actualizado', user: {
      id: String(user._id),
      email: user.email,
      role: user.role,
      photoUrl: user.photoUrl || null,
      phone: user.phone || null,
      displayName: user.displayName || null,
    } });
  } catch (error) {
    console.error('updateProfile error', error);
    return res.status(500).json({ message: 'Error interno' });
  }
}

async function updateProfilePhoto(req, res) {
  try {
    const { photoUrl, base64, fileName } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (base64 && fileName) {
      // upload to GridFS and store reference
      const { uploadBase64 } = require('../utils/gridfs');

      let contentType = 'image/jpeg';
      if (fileName.toLowerCase().endsWith('.png')) contentType = 'image/png';

      let fileId;
      try {
        fileId = await uploadBase64(base64, fileName, contentType);
      } catch (err) {
        console.error('Error saving profile image to GridFS:', err);
        return res.status(400).json({ message: 'Formato de imagen inválido' });
      }

      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        try {
          const { uploadBase64ToCloudinary } = require('../services/cloudinary');
          const uploadRes = await uploadBase64ToCloudinary(base64, fileName);
          user.photoUrl = uploadRes.url;
          user.photoCloudinaryId = uploadRes.public_id;
        } catch (cloudErr) {
          console.error('Cloudinary upload failed, using GridFS fallback:', cloudErr);
          const configuredBase = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
          const publicUrl = `${configuredBase}/api/files/${fileId}`;
          user.photoUrl = publicUrl;
          user.photoFileId = fileId;
        }
      } else {
        const configuredBase = process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
        const publicUrl = `${configuredBase}/api/files/${fileId}`;
        user.photoUrl = publicUrl;
        user.photoFileId = fileId;
      }
    } else if (photoUrl) {
      // legacy: accept a direct URL
      user.photoUrl = photoUrl;
    } else {
      return res.status(400).json({ message: 'photoUrl or base64+fileName es requerido' });
    }

    await user.save();

    // return full user payload for convenience
    const payload = {
      id: String(user._id),
      email: user.email,
      role: user.role,
      photoUrl: user.photoUrl || null,
    };

    return res.json({ message: 'Foto actualizada', user: payload });
  } catch (error) {
    console.error('updateProfilePhoto error', error);
    return res.status(500).json({ message: 'Error interno' });
  }
}

module.exports = {
  getProfile,
  updateProfilePhoto,
  updateProfile,
};
