const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { requireAuth } = require('../auth/auth.middleware');

// Obtener el horario del usuario autenticado
router.get('/', requireAuth, scheduleController.getSchedule);

// Guardar o actualizar el horario
router.post('/', requireAuth, scheduleController.saveSchedule);

// Eliminar un bloque específico
router.delete('/:blockId', requireAuth, scheduleController.deleteBlock);

module.exports = router;
