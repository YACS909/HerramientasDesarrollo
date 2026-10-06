const pool = require('../db');
const { validationResult } = require('express-validator');

exports.getAllVisitas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT v.*, 
                   i.direccion as propiedad, 
                   cl.nombre as cliente_nombre, cl.apellido as cliente_apellido,
                   a.nombre as asesor_nombre, a.apellido as asesor_apellido
            FROM visitant v
            LEFT JOIN inmueble i ON v.id_inmueble = i.id_inmueble
            LEFT JOIN clientes cl ON v.id_cliente = cl.id_cliente
            LEFT JOIN asesores a ON v.id_asesor = a.id_asesor
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener visitas' });
    }
};

exports.getVisitaById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM visitant WHERE id_visita = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Visita no encontrada' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la visita' });
    }
};

exports.createVisita = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { id_inmueble, id_cliente, id_asesor, fecha_visita, observacion } = req.body;
        const [result] = await pool.query(
            'INSERT INTO visitant (id_inmueble, id_cliente, id_asesor, fecha_visita, observacion) VALUES (?, ?, ?, ?, ?)',
            [id_inmueble, id_cliente, id_asesor, fecha_visita, observacion]
        );
        res.status(201).json({ id_visita: result.insertId, ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la visita' });
    }
};

exports.updateVisita = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha_visita, observacion } = req.body;
        const [result] = await pool.query(
            'UPDATE visitant SET fecha_visita = ?, observacion = ? WHERE id_visita = ?',
            [fecha_visita, observacion, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Visita no encontrada' });
        res.json({ message: 'Visita actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la visita' });
    }
};

exports.deleteVisita = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM visitant WHERE id_visita = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Visita no encontrada' });
        res.json({ message: 'Visita eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la visita' });
    }
};
