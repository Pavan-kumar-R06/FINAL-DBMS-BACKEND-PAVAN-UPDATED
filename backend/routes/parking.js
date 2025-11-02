
import express from 'express';
import db from '../db.js'; 
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, f.flat_number 
            FROM parking_slot p
            LEFT JOIN flat f ON p.flat_id = f.flat_id
            ORDER BY p.parking_id DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch parking slots' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {

        const [rows] = await db.query('SELECT * FROM parking_slot WHERE parking_id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Parking slot not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch parking slot' });
    }
});

router.post('/', async (req, res) => {

    const { slot_number, flat_id, apartment_id, vehicle_no, vehicle_type, is_allocated } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO parking_slot (slot_number, flat_id, apartment_id, vehicle_no, vehicle_type, is_allocated) VALUES (?, ?, ?, ?, ?, ?)',
            
            [slot_number, flat_id || null, apartment_id || null, vehicle_no || null, vehicle_type || null, is_allocated ? 1 : 0]
        );
        res.json({ parking_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create parking slot' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    
    const { slot_number, flat_id, apartment_id, vehicle_no, vehicle_type, is_allocated } = req.body;
    try {
        await db.query(
            
            'UPDATE parking_slot SET slot_number = ?, flat_id = ?, apartment_id = ?, vehicle_no = ?, vehicle_type = ?, is_allocated = ? WHERE parking_id = ?',
            
            [slot_number, flat_id || null, apartment_id || null, vehicle_no || null, vehicle_type || null, is_allocated ? 1 : 0, id]
        );
        res.json({ message: 'Parking slot updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update parking slot' });
    }
});


router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM parking_slot WHERE parking_id = ?', [id]);
        res.json({ message: 'Parking slot deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete parking slot' });
    }
});

export default router;