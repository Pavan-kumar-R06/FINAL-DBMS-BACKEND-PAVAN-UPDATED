import express from 'express';
import db from '../db.js'; 
const router = express.Router();

router.get('/assigned-requests', async (req, res) => {
    try {
        const staffId = req.query.staffId; 
        const status = req.query.status || '';

        if (!staffId) return res.status(401).json({ error: 'Unauthorized: Staff ID required.' });

        let sql = `
            SELECT 
                r.request_id AS id, 
                r.title, 
                r.description, 
                r.status,
                r.priority,
                r.request_date
            FROM service_request r 
            WHERE r.assigned_staff_id = ?
        `;
        const params = [staffId];

        if (status) {
            sql += ' AND r.status = ?';
            params.push(status);
        }

        sql += ' ORDER BY r.request_date DESC';

        const [requests] = await db.query(sql, params);
        
        res.json(requests); 
        
    } catch (err) {
        console.error('FETCH ASSIGNED REQUESTS ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

export default router;