const express = require('express');
const router = express.Router();
const visitasController = require('../controllers/visitasController');
const { body } = require('express-validator');

router.get('/', visitasController.getAllVisitas);
router.get('/:id', visitasController.getVisitaById);
router.post('/', [
    body('id_inmueble').isInt().withMessage('ID Inmueble es obligatorio'),
    body('id_cliente').isInt().withMessage('ID Cliente es obligatorio'),
    body('id_asesor').isInt().withMessage('ID Asesor es obligatorio'),
    body('fecha_visita').notEmpty().withMessage('La fecha de la visita es obligatoria')
], visitasController.createVisita);
router.put('/:id', visitasController.updateVisita);
router.delete('/:id', visitasController.deleteVisita);

module.exports = router;
