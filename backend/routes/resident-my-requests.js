import express from 'express';
import pool from '../db.js';

const router = express.Router();
router.get('/:residentId', async (req, res) => {
    const residentId = req.params.residentId;
    const { status } = req.query;

    if (!residentId || isNaN(residentId)) {
        return res.status(400).json({ error: 'Valid Resident ID is required' });
    }

    try {
        let query = `
            SELECT 
                sr.request_id,
                sr.title,
                sr.description,
                sr.status,
                DATE_FORMAT(sr.request_date, '%Y-%m-%d %H:%i:%s') AS request_date,
                sr.priority,
                sr.contact_phone,
                s.staffName
            FROM service_request sr
            LEFT JOIN staff s ON sr.assigned_staff_id = s.staff_id
            WHERE sr.owner_id = ?
        `;

        const params = [residentId];

        if (status) {
            query += ' AND sr.status = ?';
            params.push(status);
        }

        query += ' ORDER BY sr.request_date DESC';

        const [rows] = await pool.query(query, params);

        res.json(rows || []);

    } catch (err) {
        console.error("FETCH SERVICE REQUESTS ERROR:", err);
        res.status(500).json({
            error: 'Failed to fetch service requests',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

export default router;
