import express from 'express';
import db from '../db.js'; 
const router = express.Router();

router.get('/dashboard', async (req, res) => {
    try {
        const staffId = req.query.staffId; 
        if (!staffId || isNaN(staffId)) return res.status(401).json({ error: 'Unauthorized: Staff ID required.' });
        
        const [staffRows] = await db.query(`SELECT staffName AS name FROM staff WHERE staff_id = ?`, [staffId]);
        const staffName = staffRows[0]?.name || 'Staff';

        const [requestRows] = await db.query(
            `SELECT status, COUNT(*) AS count
             FROM service_request
             WHERE assigned_staff_id = ?
             GROUP BY status`, [staffId]
        );

        let requests = { pending: 0, working: 0, completed: 0, cancelled: 0 };
        let totalRequests = 0;
        
        requestRows.forEach(r => {
            const count = Number(r.count);
            totalRequests += count;
            
            if (r.status === 'Pending') requests.pending = count;
            if (r.status === 'Working') requests.working = count;
            if (r.status === 'Completed') requests.completed = count;
            if (r.status === 'Cancelled') requests.cancelled = count;
        });

        res.json({
            name: staffName,
            totalRequests,
            requests
        });

    } catch (err) {
        console.error('STAFF DASHBOARD ERROR:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;