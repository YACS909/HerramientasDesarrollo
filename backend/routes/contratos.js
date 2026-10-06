const express = require('express');
const router = express.Router();
const contratosController = require('../controllers/contratosController');
const { body } = require('express-validator');

router.get('/', contratosController.getAllContratos);
router.get('/:id', contratosController.getContratoById);
router.post('/', [
    body('id_inmueble').isInt().withMessage('ID Inmueble es obligatorio'),
    body('id_cliente').isInt().withMessage('ID Cliente es obligatorio'),
    body('id_asesor').isInt().withMessage('ID Asesor es obligatorio'),
    body('tipo_contrato').isIn(['venta', 'alquiler']).withMessage('Debe ser venta o alquiler'),
    body('monto').isNumeric().withMessage('El monto debe ser numérico')
], contratosController.createContrato);
router.put('/:id', contratosController.updateContrato);
router.delete('/:id', contratosController.deleteContrato);

module.exports = router;
