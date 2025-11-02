import express from 'express';
import pool from '../db.js';

const router = express.Router();
router.post('/service-requests', async (req, res) => {
    try {
        const { ownerId, title, description, priority, requestDate, contactPhone } = req.body;

        console.log("Incoming Data:", req.body);

        if (!ownerId || isNaN(ownerId)) {
            return res.status(400).json({ error: 'Owner ID required' });
        }

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }

        const finalRequestDate = requestDate 
            ? requestDate
            : new Date().toISOString().slice(0, 19).replace('T', ' '); // Formats to 'YYYY-MM-DD HH:MM:SS'

        const sql = `
            INSERT INTO service_request
            (title, description, owner_id, priority, contact_phone, status, request_date, created_at)
            VALUES (?, ?, ?, ?, ?, 'Pending', ?, NOW())
        `;

        const [result] = await pool.query(sql, [
            title,
            description,
            ownerId,
            priority || null,
            contactPhone || null,
            finalRequestDate 
        ]);

        res.json({ message: 'Service request submitted successfully', id: result.insertId });

    } catch (err) {
        console.error("SERVICE REQUEST INSERT ERROR:", err);
        res.status(500).json({ error: 'Server error on service request' });
    }
});

export default router;