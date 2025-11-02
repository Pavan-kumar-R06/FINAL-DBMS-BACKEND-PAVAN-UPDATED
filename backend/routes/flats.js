import express from 'express';
import pool from '../db.js'; 
const router = express.Router();
router.get('/', async (req, res) => {
    try {
        const { search, status, floor } = req.query;
        let query = `SELECT f.*, o.ownerName FROM flat f
                     LEFT JOIN owner o ON f.flat_id = o.flat_id WHERE 1`;
        const params = [];

        if (search) {
            query += ` AND (f.flat_number LIKE ? OR f.flat_type LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }
        if (status) {
            query += ` AND f.status = ?`;
            params.push(status);
        }
        if (floor) {
            query += ` AND f.floor_no = ?`;
            params.push(floor);
        }

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch flats' });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM flat WHERE flat_id = ?`, [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Flat not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch flat' });
    }
});


router.post('/', async (req, res) => {
    const {
        flat_number,
        floor_no,
        flat_type,
        status = 'Vacant',
        apartment_id,
        area_sqft = 0
    } = req.body;

    
    if (!flat_number || !floor_no || !flat_type || !apartment_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO flat (flat_number, floor_no, flat_type, status, apartment_id, area_sqft)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [flat_number, floor_no, flat_type, status, apartment_id, area_sqft]
        );

        res.json({ message: 'Flat created', flat_id: result.insertId });
    } catch (err) {
        console.error('Error saving flat:', err.message);
        res.status(500).json({ error: 'Failed to create flat' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { flat_number, floor_no, flat_type, status, apartment_id, area_sqft, owner_id } = req.body;

        await pool.query(
            `UPDATE flat SET flat_number = ?, floor_no = ?, flat_type = ?, status = ?, apartment_id = ?, area_sqft = ? 
             WHERE flat_id = ?`,
            [flat_number, floor_no, flat_type, status, apartment_id, area_sqft, req.params.id]
        );

        
        await pool.query(`UPDATE owner SET flat_id = NULL WHERE flat_id = ?`, [req.params.id]);

        
        if (owner_id) {
            await pool.query(`UPDATE owner SET flat_id = ? WHERE owner_id = ?`, [req.params.id, owner_id]);
        }

        res.json({ message: 'Flat updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update flat' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await pool.query(`DELETE FROM flat WHERE flat_id = ?`, [req.params.id]);
        res.json({ message: 'Flat deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete flat' });
    }
});

export default router;
