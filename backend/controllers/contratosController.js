const pool = require('../db');
const { validationResult } = require('express-validator');

exports.getAllContratos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.*, 
                   i.direccion as propiedad, 
                   cl.nombre as cliente_nombre, cl.apellido as cliente_apellido,
                   a.nombre as asesor_nombre, a.apellido as asesor_apellido
            FROM contrato c
            LEFT JOIN inmueble i ON c.id_inmueble = i.id_inmueble
            LEFT JOIN clientes cl ON c.id_cliente = cl.id_cliente
            LEFT JOIN asesores a ON c.id_asesor = a.id_asesor
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener contratos' });
    }
};

exports.getContratoById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM contrato WHERE id_contrato = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Contrato no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el contrato' });
    }
};

exports.createContrato = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { id_inmueble, id_cliente, id_asesor, tipo_contrato, fecha_inicio, fecha_fin, monto } = req.body;
        const [result] = await pool.query(
            'INSERT INTO contrato (id_inmueble, id_cliente, id_asesor, tipo_contrato, fecha_inicio, fecha_fin, monto) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id_inmueble, id_cliente, id_asesor, tipo_contrato, fecha_inicio, fecha_fin, monto]
        );
        res.status(201).json({ id_contrato: result.insertId, ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el contrato' });
    }
};

exports.updateContrato = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo_contrato, fecha_inicio, fecha_fin, monto } = req.body;
        const [result] = await pool.query(
            'UPDATE contrato SET tipo_contrato = ?, fecha_inicio = ?, fecha_fin = ?, monto = ? WHERE id_contrato = ?',
            [tipo_contrato, fecha_inicio, fecha_fin, monto, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Contrato no encontrado' });
        res.json({ message: 'Contrato actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el contrato' });
    }
};

exports.deleteContrato = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM contrato WHERE id_contrato = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Contrato no encontrado' });
        res.json({ message: 'Contrato eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el contrato' });
    }
};
