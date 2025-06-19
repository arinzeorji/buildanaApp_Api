const express = require("express");
const Checkout = require("../models/Checkout");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const { protectProfileAccess } = require("../middleware/authMiddleware");

const router = express.Router();

// private(loggedIn User Only) POST checkout
router.post("/api/checkout", protectProfileAccess, async(req, res) => {
    const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!checkoutItems || checkoutItems.length === 0) {
        return res.status(400).json({ message: "No Checkout Items Found" });
    }

    try {
        const newCheckout = await Checkout.create({
            user: req.user._id,
            checkoutItems: checkoutItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            paymentStatus: "Pending",
            isPaid: false
        })
        console.log(`Created CheckOut ${newCheckout}`);
        res.status(201).json(newCheckout);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
})

// PUT REQUEST TO MAKE PAYMENT FOR CHECKOUT
router.put("/api/checkout/:id/pay", protectProfileAccess, async(req, res) => {
    const { paymentStatus, paymentDetails } = req.body;

    try {
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) return res.status(404).json({ message: "Checkout Not Found" })

        if (paymentStatus === "paid") {
            checkout.isPaid = true;
            checkout.paymentStatus = paymentStatus;
            checkout.paymentDetails = paymentDetails;
            checkout.paidAt = Date.now();

            await checkout.save(); //SAVE TO DATABASE
            res.status(200).json(checkout); //SEND RESPOND
        } else {
            res.status(400).json({ message: "Invalid Payment Status" })
        }
    } catch (error) {

        console.error(error);
        res.status(500).send("server error")
    }
});

//POST FINALIZE WHEN CHECKOUT IS COMPLETED AND ORDER READY READY FOR DELIVERY
router.post("/api/checkout/:id/finalize", protectProfileAccess, async(req, res) => {
    try {
        const checkout = Checkout.findById(req, params.id);
        if (!checkout) {
            return res.status(400).json({ message: "Checkout not Found" });

            if (checkout.isPaid && !checkout.isFinalized) {
                //CREATE FINAL ORDER BASED ON THE CHECKOUT DETAILS OF THE USER
                const finalOrder = await Order.create({
                    user: checkout.user,
                    orderItems: checkout.checkoutItems,
                    shippingAddress: checkout.shippingAddress,
                    paymentMethod: checkout.paymentMethod,
                    totalPrice: checkout.totalPrice,
                    isPaid: true,
                    paidAt: checkout.paidAt,
                    isDelivered: false,
                    paymentStatus: "Paid",
                    paymentDetails: checkout.paymentDetails
                });

                //MARK THE CHECKOUT AS FINALIZED TO AVOID DUPLICATE ORDERS
                checkout.isFinalized = true;
                checkout.finalizedAt = Date.now();

                await checkout.save();

                //FIND AND CLEAR USER CART ONCE CHECKOUT IS COMPLETED
                await Cart.findOneAndDelete({ user: checkout.user });
                res.status(201).json(finalOrder)
            } else if (checkout.isFinalized) {
                res.status(400).json({ message: "Checkout Already Completed" })
            } else {
                res.status(400).json({ message: "Checkout Not Paid Yet" })
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });

    }
})


module.exports = router;