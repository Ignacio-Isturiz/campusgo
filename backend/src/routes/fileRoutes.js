const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.connection || !mongoose.connection.db) {
      return res.status(500).json({ message: 'DB no disponible' });
    }

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads',
    });

    const fileId = req.params.id;
    let _id;
    try {
      _id = new mongoose.Types.ObjectId(fileId);
    } catch (e) {
      return res.status(400).json({ message: 'Id inválido' });
    }

    const filesColl = mongoose.connection.db.collection('uploads.files');
    const fileDoc = await filesColl.findOne({ _id });
    if (!fileDoc) return res.status(404).json({ message: 'Archivo no encontrado' });

    if (fileDoc.contentType) res.set('Content-Type', fileDoc.contentType);

    const downloadStream = bucket.openDownloadStream(_id);
    downloadStream.on('error', () => {
      res.status(404).end();
    });
    downloadStream.pipe(res);
  } catch (error) {
    console.error('fileRoutes error', error);
    res.status(500).json({ message: 'Error al servir archivo' });
  }
});

module.exports = router;
