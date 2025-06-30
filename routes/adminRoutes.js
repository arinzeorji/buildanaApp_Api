const express = require("express");
const User = require("../models/User");
const Order = require("../models/Order");
const { protectProfileAccess, adminAccess } = require("../middleware/authMiddleware")

const router = express.Router();

// GET ALL USERS AS AN ADMIN
router.get("/api/admin/users", protectProfileAccess, adminAccess, async(req, res) => {

    try {
        const users = await User.finf({});
        if (!users) return res.status(404).json({ message: "No Users Found" });

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" })
    }
})


//ADMIN POST REQUEST FOR NEW USERS
router.post("/api/admin/users", protectProfileAccess, adminAccess, async(req, res) => {

    try {
        const { name, email, role, password } = req.body;

        const user = await User.findOne({ email })

        if (user) {
            return res.status(400).json({ message: "A User Already exist with this Email" })
        } else {
            user = new User({
                name,
                email,
                role: role || "Customer",
                password,
            })

            await user.save();
            res.status(200).json(user)
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" })
    }
})

//PUT REQUEST TO UPDATE USER INFO
router.put("api/admin/users/:id", protectProfileAccess, adminAccess, async(req, res) => {
    const { name, email, role, password } = req.body;
    try {
        const user = await User.findById({ id: req.params.id })

        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            user.role = role || user.role;
            user.password = password || user.password;

            const updatedUser = await user.save();
            res.json({ user: updatedUser, message: "User Details Updated Successfully" });


        } else {
            return res.status.json({ message: "No User Found" })
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" })
    }
})

//ADMIN ROUTE TO DELETE USERS
router.delete("/api/admin/users/:id", protectProfileAccess, adminAccess, async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.status(200).json({ message: "User Deleted" });
        } else {
            res.status(404).json({ message: "User Not Found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" })
    }
})

module.exports = router;