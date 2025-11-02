

import express from 'express';
import db from '../db.js'; 
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { search, status, role } = req.query;
        let query = `SELECT * FROM staff WHERE 1=1`;
        const params = [];

        if (search) {
            query += ` AND (staffName LIKE ? OR role LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (status !== undefined) { 
            let isActiveValue;
            if (status === 'Active') {
                isActiveValue = 1; 
            } else if (status === 'Inactive') {
                isActiveValue = 0; 
            }
            
            if (isActiveValue !== undefined) {
                query += ` AND is_active = ?`;
                params.push(isActiveValue);
            }
        }
        
        if (role) {
            query += ` AND role = ?`;
            params.push(role);
        }
        
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/", async (req, res) => {
    try {
        const { staffName, role, phone, email, is_active } = req.body;

        const sql = `
        INSERT INTO staff (staffName, role, phone, email, is_active)
        VALUES (?, ?, ?, ?, ?)
        `;
        await db.query(sql, [staffName, role, phone || null, email || null, is_active ?? 1]);
        res.json({ message: "Staff added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { staffName, role, phone, email, is_active } = req.body;

        const sql = `
        UPDATE staff SET staffName=?, role=?, phone=?, email=?, is_active=?
        WHERE staff_id=?
        `;
        await db.query(sql, [staffName, role, phone || null, email || null, is_active ?? 1, id]);
        res.json({ message: "Staff updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM staff WHERE staff_id=?", [id]);
        res.json({ message: "Staff deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;