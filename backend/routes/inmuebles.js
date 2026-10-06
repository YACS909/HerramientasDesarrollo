const express = require('express');
const router = express.Router();
const inmueblesController = require('../controllers/inmueblesController');
const { body } = require('express-validator');

router.get('/', inmueblesController.getAllInmuebles);
router.get('/:id', inmueblesController.getInmuebleById);
router.post('/', [
    body('direccion').notEmpty().withMessage('La dirección es obligatoria'),
    body('ciudad').notEmpty().withMessage('La ciudad es obligatoria'),
    body('precio').isNumeric().withMessage('El precio debe ser un número')
], inmueblesController.createInmueble);
router.put('/:id', inmueblesController.updateInmueble);
router.delete('/:id', inmueblesController.deleteInmueble);

module.exports = router;
