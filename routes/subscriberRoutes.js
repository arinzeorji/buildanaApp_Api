const express = require("express")
const Subscriber = require("../models/Subscriber")

const router = express.Router();

//POST ROUTE FOR SUBSCRIBERS
router.post("/api/subscribe", async(req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: "Please Provide a Valid Email" })

        //CHECK IF THE EMAIL ALREADY EXIST / SUBSCRIBE
        const subscriber = await Subscriber.findOne({ email })

        if (subscriber) {
            return res.status(400).json({ message: "This Email Has Been Subscribed" })
        }

        //CREATE A NEW SUBSCRIBER
        subscriber = new Subscriber({ email })

        await subscriber.save();

        res.status(200).json(subscriber);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" })
    }
})


module.exports = router;