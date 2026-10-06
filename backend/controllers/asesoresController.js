const pool = require('../db');
const { validationResult } = require('express-validator');

// Obtener todos los asesores
exports.getAllAsesores = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM asesores');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener asesores' });
    }
};

// Obtener un asesor por ID
exports.getAsesorById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM asesores WHERE id_asesor = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Asesor no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el asesor' });
    }
};

// Crear un asesor
exports.createAsesor = async (req, res) => {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { nombre, apellido, telefono, email, fecha_alta } = req.body;
        const [result] = await pool.query(
            'INSERT INTO asesores (nombre, apellido, telefono, email, fecha_alta) VALUES (?, ?, ?, ?, ?)',
            [nombre, apellido, telefono, email, fecha_alta || new Date()]
        );
        res.status(201).json({ id_asesor: result.insertId, nombre, apellido, telefono, email, fecha_alta });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el asesor' });
    }
};

// Actualizar un asesor
exports.updateAsesor = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, telefono, email } = req.body;
        const [result] = await pool.query(
            'UPDATE asesores SET nombre = ?, apellido = ?, telefono = ?, email = ? WHERE id_asesor = ?',
            [nombre, apellido, telefono, email, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Asesor no encontrado' });
        res.json({ message: 'Asesor actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el asesor' });
    }
};

// Eliminar un asesor
exports.deleteAsesor = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM asesores WHERE id_asesor = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Asesor no encontrado' });
        res.json({ message: 'Asesor eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el asesor. Puede que tenga contratos asociados.' });
    }
};
