import express from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password || !role) {
            return res.status(400).json({ message: "All fields required" });
        }
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE username = ? AND role = ?",
            [username, role]
        );
        if (rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials or role mismatch" });
        }
        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Invalid password" });
        }

        if (role === "resident" && !user.owner_id) {
            return res.status(400).json({ message: "User role not linked to owner record" });
        }
        if (role === "staff" && !user.staff_id) {
            return res.status(400).json({ message: "User role not linked to staff record" });
        }
        const loginId =
            role === "resident" ? user.owner_id :
            role === "staff"    ? user.staff_id :
                                  user.user_id;

        res.json({
            message: "Login successful",
            user: {
                id: loginId,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;