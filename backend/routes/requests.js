import express from 'express';
import db from '../db.js'; 
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { status, staff, owner, search } = req.query;
    let sql = `
      SELECT 
        r.request_id AS id, 
        r.title AS requestType, 
        r.description, 
        r.status, 
        r.request_date AS requestDate,
        r.assigned_staff_id AS assignedStaffId,
        o.ownerName AS ownerName, 
        s.staffName AS staffName
      FROM service_request r
      JOIN owner o ON r.owner_id = o.owner_id
      LEFT JOIN staff s ON r.assigned_staff_id = s.staff_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += " AND r.status = ?";
      params.push(status);
    }
    if (staff) {
      sql += " AND r.assigned_staff_id = ?";
      params.push(staff);
    }
    if (owner) {
      sql += " AND r.owner_id = ?";
      params.push(owner);
    }
    if (search) {
      
      sql += " AND (r.title LIKE ? OR r.description LIKE ? OR o.ownerName LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += " ORDER BY r.request_date DESC";
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("GET REQUESTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    
    const { ownerId, requestType, description } = req.body; 
    if (!ownerId || !requestType) {
      return res.status(400).json({ error: "ownerId and requestType are required" });
    }

    
    const sql = `INSERT INTO service_request (owner_id, title, description) VALUES (?, ?, ?)`;
    const [result] = await db.query(sql, [ownerId, requestType, description || null]);

    
    const [rows] = await db.query(
      `SELECT r.request_id AS id, r.title AS requestType, o.ownerName 
       FROM service_request r 
       JOIN owner o ON r.owner_id = o.owner_id 
       WHERE r.request_id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST REQUESTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedStaffId, status } = req.body;

    
    const fields = [];
    const params = [];
    let setResolvedDate = false;

    if (assignedStaffId !== undefined) {
      
      fields.push("assigned_staff_id = ?");
      params.push(assignedStaffId || null);
    }
    if (status) {
      fields.push("status = ?");
      params.push(status);
      if (status === 'Completed' || status === 'Cancelled') {
         setResolvedDate = true;
      }
    }
    
    if (setResolvedDate) {
        fields.push("resolved_date = NOW()");
    } else {

        fields.push("resolved_date = NULL");
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const sql = `UPDATE service_request SET ${fields.join(", ")} WHERE request_id = ?`;
    params.push(id);

    await db.query(sql, params);

    const [rows] = await db.query(
      `SELECT 
         r.request_id AS id, r.title AS requestType, r.description, r.status, r.request_date AS requestDate,
         r.assigned_staff_id AS assignedStaffId,
         o.ownerName, s.staffName
       FROM service_request r
        JOIN owner o ON r.owner_id=o.owner_id
        LEFT JOIN staff s ON r.assigned_staff_id=s.staff_id
        WHERE r.request_id = ?`,
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("PUT REQUESTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query("DELETE FROM service_request WHERE request_id = ?", [id]); 
    res.json({ message: "Request deleted" });
  } catch (err) {
    console.error("DELETE REQUESTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/meta/staff", async (req, res) => {
  try {
    
    const [rows] = await db.query("SELECT staff_id AS id, staffName AS name, role FROM staff ORDER BY name");
    res.json(rows);
  } catch (err) {
    console.error("GET STAFF LIST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/meta/owners", async (req, res) => {
  try {
    
    const [rows] = await db.query("SELECT owner_id AS id, ownerName AS name, flat_id FROM owner ORDER BY name");
    res.json(rows);
  } catch (err) {
    console.error("GET OWNER LIST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;