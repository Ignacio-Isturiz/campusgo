const User = require('../models/User');
const fs = require('fs');
const path = require('path');

async function getProfile(req, res) {
  const user = await User.findById(req.user._id).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  return res.json({ user });
}

async function updateProfilePhoto(req, res) {
  try {
    const { photoUrl, base64, fileName } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (base64 && fileName) {
      // decode base64 and write file to public/uploads
      const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      // Extract base64 data if it comes with data URL prefix
      let base64Data = base64;
      if (base64.includes(',')) {
        base64Data = base64.split(',')[1];
      }

      // sanitize filename
      const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = path.join(uploadsDir, safeName);
      
      try {
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, buffer);
      } catch (bufferError) {
        console.error('Error creating buffer from base64:', bufferError);
        return res.status(400).json({ message: 'Formato de imagen inválido' });
      }

      // build public URL
      const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${safeName}`;
      user.photoUrl = publicUrl;
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
};
