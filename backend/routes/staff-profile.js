import express from 'express';
import db from '../db.js';

const router = express.Router();
router.get('/profile', async (req, res) => {
    try {
        const staffId = req.query.staffId; 

        if (!staffId) return res.status(400).json({ error: 'Staff ID required' });

        const [rows] = await db.query(
            'SELECT staff_id AS id, staffName AS name, role, phone AS contact, email, created_at AS joinDate, is_active AS status FROM staff WHERE staff_id = ?',
            [staffId]
        );

        if (rows.length === 0) return res.status(404).json({ error: 'Staff not found' });

        const staff = rows[0];
        staff.status = staff.status === 1 ? 'Active' : 'Inactive';

        res.json(staff);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/profile/status', async (req, res) => {
    try {
        const { staffId, status } = req.body;

        if (!staffId) return res.status(400).json({ error: 'Staff ID required' });
        if (!['Active', 'Inactive'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

        const isActive = status === 'Active' ? 1 : 0;
        await db.query('UPDATE staff SET is_active = ? WHERE staff_id = ?', [isActive, staffId]);

        res.json({ message: 'Status updated successfully', status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;