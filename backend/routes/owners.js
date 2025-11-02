import express from 'express';
import pool from '../db.js'; 
const router = express.Router();
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT o.*, f.flat_number 
            FROM owner o 
            LEFT JOIN flat f ON o.flat_id = f.flat_id
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch owners' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT o.*, f.flat_number 
            FROM owner o 
            LEFT JOIN flat f ON o.flat_id = f.flat_id
            WHERE o.owner_id = ?
        `, [req.params.id]);

        if (!rows.length) return res.status(404).json({ error: 'Owner not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch owner' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { ownerName, phone, email, flat_id } = req.body;

        const [result] = await pool.query(
            `INSERT INTO owner (ownerName, phone, email, flat_id) VALUES (?, ?, ?, ?)`,
            [ownerName, phone || null, email || null, flat_id || null]
        );

        
        if (flat_id) {
            await pool.query(`UPDATE flat SET status = 'Occupied' WHERE flat_id = ?`, [flat_id]);
        }

        res.json({ message: 'Owner created', owner_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create owner' });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const { ownerName, phone, email, flat_id } = req.body;

       
        const [prev] = await pool.query(`SELECT flat_id FROM owner WHERE owner_id = ?`, [req.params.id]);
        const prevFlatId = prev[0]?.flat_id;

        await pool.query(
            `UPDATE owner SET ownerName = ?, phone = ?, email = ?, flat_id = ? WHERE owner_id = ?`,
            [ownerName, phone || null, email || null, flat_id || null, req.params.id]
        );

      
        if (prevFlatId && prevFlatId != flat_id) {
            await pool.query(`UPDATE flat SET status = 'Vacant' WHERE flat_id = ?`, [prevFlatId]);
        }
        if (flat_id) {
            await pool.query(`UPDATE flat SET status = 'Occupied' WHERE flat_id = ?`, [flat_id]);
        }

        res.json({ message: 'Owner updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update owner' });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        
        const [rows] = await pool.query(`SELECT flat_id FROM owner WHERE owner_id = ?`, [req.params.id]);
        const flatId = rows[0]?.flat_id;

        await pool.query(`DELETE FROM owner WHERE owner_id = ?`, [req.params.id]);

        
        if (flatId) {
            await pool.query(`UPDATE flat SET status = 'Vacant' WHERE flat_id = ?`, [flatId]);
        }

        res.json({ message: 'Owner deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete owner' });
    }
});

export default router;
