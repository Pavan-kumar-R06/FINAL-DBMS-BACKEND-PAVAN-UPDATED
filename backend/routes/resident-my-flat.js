import express from 'express';
import db from '../db.js'; 
const router = express.Router();

router.get('/:ownerId', async (req, res) => {
    const { ownerId } = req.params;
    console.log('Request received for ownerId:', ownerId);

    if (!ownerId || isNaN(ownerId)) {
        return res.status(400).json({ error: 'Valid ownerId is required' });
    }

    try {
        const sqlFlat = `
            SELECT 
                f.flat_id, 
                f.flat_number AS flatNumber, 
                f.floor_no AS floorNo, 
                f.area_sqft AS area,
                o.ownerName AS ownerName,
                o.phone AS ownerContact,
                o.email AS ownerEmail
            FROM flat f
            JOIN owner o ON f.flat_id = o.flat_id
            WHERE o.owner_id = ?
            LIMIT 1
        `;

        const [flatRows] = await db.query(sqlFlat, [ownerId]);
        console.log('Flat query result:', flatRows);

        if (!flatRows || flatRows.length === 0) {
            return res.status(404).json({ error: 'No flat found for this resident' });
        }

        const flatInfo = flatRows[0];

        const sqlParking = `
            SELECT 
                parking_id, 
                slot_number AS slotNumber, 
                vehicle_no AS vehicleNo, 
                vehicle_type AS vehicleType, 
                CASE WHEN is_allocated = 1 THEN 'Occupied' ELSE 'Vacant' END AS status
            FROM parking_slot
            WHERE flat_id = ?
        `;
        const [parkingRows] = await db.query(sqlParking, [flatInfo.flat_id]);
        console.log('Parking query result:', parkingRows);

        flatInfo.parkingSlots = parkingRows || [];

        res.json(flatInfo);

    } catch (err) {
        console.error('FETCH FLAT ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

export default router;