import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();


   // Get Profile //

router.get("/profile/:id/:role", async (req, res) => {
    try {

        const { id, role } = req.params;

        let query;

        if (role === "resident") {

            query = `
                SELECT ownerName AS name, email
                FROM owner
                WHERE owner_id = ?
            `;

        } else if (role === "staff") {

            query = `
                SELECT staffName AS name, email
                FROM staff
                WHERE staff_id = ?
            `;

        } else {

            return res.status(400).json({
                message: "Invalid role"
            });

        }

        const [rows] = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(rows[0]);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Server Error"
        });

    }
});



   //Update Profile//

router.put("/profile", async (req, res) => {

    try {

        const { id, role, name, email } = req.body;

        if (role === "resident") {

            await pool.query(
                `UPDATE owner
                 SET ownerName=?, email=?
                 WHERE owner_id=?`,
                [name, email, id]
            );

            await pool.query(
                `UPDATE users
                 SET username=?
                 WHERE owner_id=?`,
                [name, id]
            );

        } else if (role === "staff") {

            await pool.query(
                `UPDATE staff
                 SET staffName=?, email=?
                 WHERE staff_id=?`,
                [name, email, id]
            );

            await pool.query(
                `UPDATE users
                 SET username=?
                 WHERE staff_id=?`,
                [name, id]
            );

        } else {

            return res.status(400).json({
                message: "Invalid role"
            });

        }

        return res.json({
            success: true,
            message: "Profile updated successfully."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }

});



   //Change Password//

router.put("/password", async (req, res) => {

    try {

        const { id, role, currentPassword, newPassword } = req.body;
        const passwordRegex =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]{6,}$/;

if (!passwordRegex.test(newPassword)) {

    return res.status(400).json({

        success: false,

        message:
            "Password must contain at least 6 characters, one uppercase letter, one lowercase letter, one number and one special character."

    });

}

        let query;

        if (role === "resident") {

            query = `
                SELECT *
                FROM users
                WHERE owner_id=?
            `;

        } else if (role === "staff") {

            query = `
                SELECT *
                FROM users
                WHERE staff_id=?
            `;

        } else {

            return res.status(400).json({
                message: "Invalid role"
            });

        }

        const [rows] = await pool.query(query, [id]);

        if (rows.length === 0) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        const user = rows[0];

        const match = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!match) {

            return res.status(400).json({
                success: false,
                message: "Current password is incorrect."
            });

        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await pool.query(
            `UPDATE users
             SET password=?
             WHERE user_id=?`,
            [hashed, user.user_id]
        );

        return res.json({
            success: true,
            message: "Password updated successfully."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

});

export default router;