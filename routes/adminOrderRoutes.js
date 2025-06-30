const express = require("express");
const Order = require("../models/Order");
const { protectProfileAccess, adminAccess } = require("../middleware/authMiddleware")

const router = express.Router();



//ADMIN ORDER ROUTES
//ROUTES FOR THE ADMIN TO GET DELETE AND UPDATE THE ORDERS
router.get("/api/admin/orders", protectProfileAccess, adminAccess, async(req, res) => {

    try {
        const orders = await Order.find({}).populate("user", "name email");
        if (orders) {
            res.json(orders)
        } else {
            res.status(404).json({ message: "No Orders Found" })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
})


//ADMIN REQUEST TO UPADTE ORDERS
router.put("/api/admin/orders/:id", protectProfileAccess, adminAccess, async(req, res) => {
    const { status } = req.body;
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status || order.status;
            order.isDelivered = status === "Delivered" ? true : order.isDelivered;
            order.deliveredAt = status === "Delivered" ? Date.now() : order.deliveredAt;

            const updatedOrder = await order.save();
            res.json(updatedOrder)
        } else {
            res.status(404).json({ message: "Order Not Found" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" })
    }
})

//ADMIN ORDER DELETE ROUTE
router.delete("/api/admin/order/:id", protectProfileAccess, adminAccess, async(req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            await order.deleteOne();
            res.json({ message: "Order has been deleted" })
        } else {
            res.status(404).json({ message: "Order Not Found" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });

    }
})


module.exports = router;