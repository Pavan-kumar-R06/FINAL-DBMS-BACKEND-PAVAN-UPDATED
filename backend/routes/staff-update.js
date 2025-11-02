import express from 'express';
import db from '../db.js'; 
const router = express.Router();

router.get('/assigned-list', async (req, res) => {
    try {
        const staffId = Number(req.query.staffId); 
        if (!staffId) return res.status(401).json({ error: 'Unauthorized: Staff ID required.' });

        let sql = `
            SELECT 
                r.request_id AS id, 
                r.title, 
                r.description,
                r.status,
                r.request_date
            FROM service_request r 
            WHERE r.assigned_staff_id = ?
            AND r.status IN ('Pending', 'Working')
            ORDER BY r.request_date DESC
        `;
        
        const [requests] = await db.query(sql, [staffId]);
        res.json(requests); 
        
    } catch (err) {
        console.error('FETCH ASSIGNED LIST ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

router.get('/details/:requestId', async (req, res) => {
    try {
        const staffId = Number(req.query.staffId); 
        const requestId = Number(req.params.requestId); 

        if (!staffId || !requestId) return res.status(401).json({ error: 'IDs required.' });

        const [rows] = await db.query(`
            SELECT 
                r.request_id AS id, 
                r.title AS serviceType, 
                r.status, 
                r.description,
                o.ownerName AS residentName,
                f.flat_number AS flatNumber
            FROM service_request r
            JOIN owner o ON r.owner_id = o.owner_id
            JOIN flat f ON o.flat_id = f.flat_id
            WHERE r.request_id = ? AND r.assigned_staff_id = ?`, 
            [requestId, staffId]
        );
        
        if (!rows.length) return res.status(404).json({ error: 'Request not found or not assigned to you.' });
        res.json(rows[0]);
    } catch (err) {
        console.error('FETCH REQUEST DETAILS ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

router.put('/update-request/:requestId', async (req, res) => {
    try {
        const requestId = Number(req.params.requestId);
        const staffId = Number(req.body.staffId); 
        const { status, notes } = req.body; 

        if (!staffId) return res.status(401).json({ error: 'Unauthorized: Staff ID required.' });
        if (!['Pending', 'Working', 'Completed', 'Cancelled'].includes(status)) 
            return res.status(400).json({ error: 'Invalid status.' });

        const sqlCheck = 'SELECT description FROM service_request WHERE request_id = ? AND assigned_staff_id = ?';
        const [rows] = await db.query(sqlCheck, [requestId, staffId]);

        if (rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized to update this request.' });
        }

        const resolvedDate = (status === 'Completed') ? new Date() : null;
        const finalDescription = notes || rows[0].description; 

        await db.query(`
            UPDATE service_request
            SET 
                status = ?, 
                description = ?, 
                resolved_date = ?
            WHERE request_id = ?`,
            [status, finalDescription, resolvedDate, requestId]
        );

        res.json({ message: 'Request updated successfully' });
    } catch (err) {
        console.error('UPDATE STATUS ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

export default router;