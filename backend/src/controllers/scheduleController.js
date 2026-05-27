const Schedule = require('../models/Schedule');

// Obtener el horario del usuario autenticado
exports.getSchedule = async (req, res) => {
  try {
    const userId = req.user.id;

    const schedule = await Schedule.findOne({ userId });

    if (!schedule) {
      return res.json({
        blocks: [],
        message: 'No hay horario guardado aún.',
      });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Error obteniendo horario:', error);
    res.status(500).json({
      message: 'Error obteniendo horario',
    });
  }
};

// Guardar o actualizar el horario del usuario
exports.saveSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { blocks } = req.body;

    if (!Array.isArray(blocks)) {
      return res.status(400).json({
        message: 'Los bloques deben ser un array',
      });
    }

    let schedule = await Schedule.findOne({ userId });

    if (!schedule) {
      schedule = new Schedule({
        userId,
        blocks,
      });
    } else {
      schedule.blocks = blocks;
    }

    await schedule.save();

    res.json({
      message: 'Horario guardado exitosamente',
      schedule,
    });
  } catch (error) {
    console.error('Error guardando horario:', error);
    res.status(500).json({
      message: 'Error guardando horario',
    });
  }
};

// Eliminar un bloque de clase específico
exports.deleteBlock = async (req, res) => {
  try {
    const userId = req.user.id;
    const { blockId } = req.params;

    const schedule = await Schedule.findOne({ userId });

    if (!schedule) {
      return res.status(404).json({
        message: 'No hay horario para este usuario',
      });
    }

    schedule.blocks = schedule.blocks.filter(b => b.id !== blockId);
    await schedule.save();

    res.json({
      message: 'Bloque eliminado exitosamente',
      schedule,
    });
  } catch (error) {
    console.error('Error eliminando bloque:', error);
    res.status(500).json({
      message: 'Error eliminando bloque',
    });
  }
};
