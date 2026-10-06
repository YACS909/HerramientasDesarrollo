const pool = require('../db');
const { validationResult } = require('express-validator');

exports.getAllInmuebles = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT i.*, e.nombre_estado, t.nombre_tipo, a.nombre as nombre_asesor, a.apellido as apellido_asesor
            FROM inmueble i
            LEFT JOIN estadosi e ON i.id_estado = e.id_estado
            LEFT JOIN tipo_inmueble t ON i.id_tipo = t.id_tipo
            LEFT JOIN asesores a ON i.id_asesor = a.id_asesor
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener inmuebles' });
    }
};

exports.getInmuebleById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM inmueble WHERE id_inmueble = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Inmueble no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el inmueble' });
    }
};

exports.createInmueble = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { direccion, ciudad, metros2, habitaciones, banos, precio, id_estado, id_asesor, id_tipo } = req.body;
        const [result] = await pool.query(
            'INSERT INTO inmueble (direccion, ciudad, metros2, habitaciones, banos, precio, id_estado, id_asesor, id_tipo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [direccion, ciudad, metros2, habitaciones, banos, precio, id_estado, id_asesor, id_tipo]
        );
        res.status(201).json({ id_inmueble: result.insertId, ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el inmueble' });
    }
};

exports.updateInmueble = async (req, res) => {
    try {
        const { id } = req.params;
        const { direccion, ciudad, metros2, habitaciones, banos, precio, id_estado, id_asesor, id_tipo } = req.body;
        const [result] = await pool.query(
            'UPDATE inmueble SET direccion = ?, ciudad = ?, metros2 = ?, habitaciones = ?, banos = ?, precio = ?, id_estado = ?, id_asesor = ?, id_tipo = ? WHERE id_inmueble = ?',
            [direccion, ciudad, metros2, habitaciones, banos, precio, id_estado, id_asesor, id_tipo, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Inmueble no encontrado' });
        res.json({ message: 'Inmueble actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el inmueble' });
    }
};

exports.deleteInmueble = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM inmueble WHERE id_inmueble = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Inmueble no encontrado' });
        res.json({ message: 'Inmueble eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el inmueble' });
    }
};
