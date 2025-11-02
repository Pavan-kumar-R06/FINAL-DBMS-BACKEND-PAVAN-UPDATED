import express from 'express';
import db from '../db.js'; 
const router = express.Router();

router.get('/dashboard', async (req, res) => {
    try {
        const ownerId = req.query.ownerId; 
        
        if (!ownerId || isNaN(ownerId)) {
             return res.status(401).json({ error: 'Unauthorized: Resident ID required.' });
        }

        const [ownerFlatRows] = await db.query(
            `SELECT o.ownerName AS name, f.flat_number AS number, f.floor_no AS floor, f.area_sqft AS area
             FROM owner o
             JOIN flat f ON o.flat_id = f.flat_id
             WHERE o.owner_id = ?`, [ownerId]
        );
        
        const residentData = ownerFlatRows[0];

        if (!residentData) {
            return res.status(404).json({ error: 'Resident data not found.' });
        }

        const [parkingRows] = await db.query(
            `SELECT slot_number AS slotNumber, vehicle_no AS vehicle, vehicle_type AS vehicleType
             FROM parking_slot
             WHERE flat_id = (SELECT flat_id FROM owner WHERE owner_id = ?)`, [ownerId]
        );

        const [requestsRows] = await db.query(
            `SELECT status, COUNT(*) AS count
             FROM service_request
             WHERE owner_id = ? AND status IN ('Pending', 'Working', 'Assigned')
             GROUP BY status`, [ownerId]
        );

        let activeRequests = { total: 0, pending: 0, working: 0 };
        requestsRows.forEach(r => {
            activeRequests.total += r.count;
            if (r.status === 'Pending') activeRequests.pending = r.count;
            if (r.status === 'Working' || r.status === 'Assigned') activeRequests.working += r.count;
        });

        res.json({
            name: residentData.name,
            flat: {
                number: residentData.number,
                floor: residentData.floor,
                area: residentData.area,
            },
            parking: parkingRows[0] || null,
            activeRequests
        });

    } catch (err) {
        console.error('DASHBOARD FETCH ERROR:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;