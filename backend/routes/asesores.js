const express = require('express');
const router = express.Router();
const asesoresController = require('../controllers/asesoresController');
const { body } = require('express-validator');

// GET: Obtener todos los asesores
router.get('/', asesoresController.getAllAsesores);

// GET: Obtener un asesor por ID
router.get('/:id', asesoresController.getAsesorById);

// POST: Crear nuevo asesor con validaciones
router.post('/', [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('Debe ser un email válido'),
    body('telefono').notEmpty().withMessage('El teléfono es obligatorio')
], asesoresController.createAsesor);

// PUT: Actualizar un asesor existente
router.put('/:id', asesoresController.updateAsesor);

// DELETE: Eliminar un asesor
router.delete('/:id', asesoresController.deleteAsesor);

module.exports = router;
