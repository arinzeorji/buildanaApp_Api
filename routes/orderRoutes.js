const express = require("express");
const Order = require("../models/Order");
const { protectProfileAccess } = require("../middleware/authMiddleware")


const router = express.Router();

//GET ALL LOGGED_ID USERS ORDERS FROM THE DATABASE
router.get("/api/orders", protectProfileAccess, async(req, res) => {
    try {
        // GET ALL ORDERS OF THE AUTHENTICATED USERS AND SORT BY MOST RECENT IN CREATED_AT
        const orders = Order.find({ user: req.user._id }).sort({ createdAt: -1 })
        if (orders) {
            res.json(orders)
        } else {
            return res.status(404).json({ message: "No Orders Found" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" })
    }
})

// GET A PARTICULAR ORDER FORM THE USER ORDER
router.get("/api/orders/:id", protectProfileAccess, async(req, res) => {
    try {
        const order = Order.findById(req.params.id).populate(
            "user",
            "name email"
        )
        if (!order) {
            res.status(404).json({ message: "Order Not Found" })
        }
        //IF ORDER IS FOUND
        res.json(order);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" })
    }
})

module.exports = router;