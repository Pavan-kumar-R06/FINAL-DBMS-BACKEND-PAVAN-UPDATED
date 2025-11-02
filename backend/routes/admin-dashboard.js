import express from 'express';
import db from '../db.js'; 
const router = express.Router();
const toInt = (val) => val ? parseInt(val) : 0;

router.get('/', async (req, res) => {
    try {
        const [flatsRows] = await db.query(`
            SELECT COUNT(*) AS totalFlats,
                   SUM(CASE WHEN status='Occupied' THEN 1 ELSE 0 END) AS occupiedFlats,
                   SUM(CASE WHEN status='Vacant' THEN 1 ELSE 0 END) AS vacantFlats
            FROM flat
        `);
        const [staffOverviewRows] = await db.query(`
            SELECT staff_id, staffName, role, 
                CASE WHEN is_active=1 THEN 'Active' ELSE 'Inactive' END AS status
            FROM staff
        `);
        const [ownersRows] = await db.query(`SELECT COUNT(*) AS totalOwners FROM owner`);
        const [parkingRows] = await db.query(`SELECT COUNT(*) AS totalParkingSlots FROM parking_slot`);
        const [workloadRows] = await db.query(`
            SELECT s.staff_id AS staffId, s.staffName, s.role, 
                CASE WHEN s.is_active=1 THEN 'Active' ELSE 'Inactive' END AS status,
                COUNT(r.request_id) AS totalRequests,
                SUM(CASE WHEN r.status='Completed' THEN 1 ELSE 0 END) AS completedRequests,
                SUM(CASE WHEN r.status IN ('Pending','Working') THEN 1 ELSE 0 END) AS pendingRequests
            FROM staff s
            LEFT JOIN service_request r ON r.assigned_staff_id = s.staff_id
            GROUP BY s.staff_id, s.staffName, s.role, s.is_active
        `);

        const [recentRequestsRows] = await db.query(`
            SELECT 
                r.request_id AS requestId, 
                r.title AS serviceType, 
                r.status, 
                r.created_at AS requestDate,
                o.ownerName AS ownerName, 
                s.staffName AS assignedStaff
            FROM service_request r
            LEFT JOIN owner o ON r.owner_id = o.owner_id
            LEFT JOIN staff s ON r.assigned_staff_id = s.staff_id
            ORDER BY r.created_at DESC
            LIMIT 5
        `);

        
const [apartmentsRows] = await db.query(`
    SELECT 
        a.name, 
        a.address, 
        a.total_floors AS totalFloors, 
        COUNT(f.flat_id) AS totalFlats, 
        SUM(CASE WHEN f.status = 'Occupied' THEN 1 ELSE 0 END) AS occupiedFlats,
        SUM(CASE WHEN f.status = 'Vacant' THEN 1 ELSE 0 END) AS vacantFlats
    FROM apartment a
    LEFT JOIN flat f ON a.apartment_id = f.apartment_id
    GROUP BY a.apartment_id, a.name, a.address, a.total_floors
`);
        res.json({
            
            totalFlats: toInt(flatsRows[0].totalFlats),
            occupiedFlats: toInt(flatsRows[0].occupiedFlats),
            vacantFlats: toInt(flatsRows[0].vacantFlats),
            totalStaff: staffOverviewRows.length,
            activeStaff: staffOverviewRows.filter(s => s.status === 'Active').length,
            inactiveStaff: staffOverviewRows.filter(s => s.status === 'Inactive').length,
            totalOwners: toInt(ownersRows[0].totalOwners),
            totalParkingSlots: toInt(parkingRows[0].totalParkingSlots),
            
            // Tables
            staffWorkload: workloadRows,
            recentRequests: recentRequestsRows,
            apartments: apartmentsRows
        });

    } catch (err) {
        console.error('ADMIN DASHBOARD SERVER ERROR:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

export default router;