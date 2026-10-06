const pool = require('../db');
const { validationResult } = require('express-validator');

exports.getAllClientes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clientes');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
};

exports.getClienteById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM clientes WHERE id_cliente = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el cliente' });
    }
};

exports.createCliente = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { nombre, apellido, dni, telefono, email, direccion } = req.body;
        const [result] = await pool.query(
            'INSERT INTO clientes (nombre, apellido, dni, telefono, email, direccion) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, apellido, dni, telefono, email, direccion]
        );
        res.status(201).json({ id_cliente: result.insertId, nombre, apellido, dni, telefono, email, direccion });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el cliente' });
    }
};

exports.updateCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, dni, telefono, email, direccion } = req.body;
        const [result] = await pool.query(
            'UPDATE clientes SET nombre = ?, apellido = ?, dni = ?, telefono = ?, email = ?, direccion = ? WHERE id_cliente = ?',
            [nombre, apellido, dni, telefono, email, direccion, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json({ message: 'Cliente actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
};

exports.deleteCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM clientes WHERE id_cliente = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el cliente. Puede que tenga contratos/visitas asociados.' });
    }
};
