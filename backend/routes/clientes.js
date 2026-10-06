const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { body } = require('express-validator');

router.get('/', clientesController.getAllClientes);
router.get('/:id', clientesController.getClienteById);
router.post('/', [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('dni').notEmpty().withMessage('El DNI es obligatorio').isLength({ min: 8, max: 8 }).withMessage('El DNI debe tener 8 dígitos'),
    body('email').isEmail().withMessage('Debe ser un email válido')
], clientesController.createCliente);
router.put('/:id', clientesController.updateCliente);
router.delete('/:id', clientesController.deleteCliente);

module.exports = router;
