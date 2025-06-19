const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protectProfileAccess } = require("../middleware/authMiddleware")

const router = express.Router();
router.use(express.json());

//USER REGISTRATIO ROUTE
router.post("/api/users/register", async(req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    try {
        //user registration 
        let user = await User.findOne({ email });
        if (user) await res.status(400).json({ message: "User with Email already exists" });

        user = new User({ name, email, password });
        await user.save();

        // create JWT PAYLOAD
        const payload = { user: { id: user._id, role: user.role } }

        // sign and return token along with user data
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "72h" }, (err, token) => {
            if (err) throw err;

            //send user data
            res.status(201).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            })
        });

    } catch (error) {
        console.log(error)
        res.status(500).send("Server  Error")
    }
})

// USER LOGIN ROUTE
router.post("/api/users/login", async(req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        //find user with recieved email
        let user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Wrong Email and Password " });
        const isMatch = await user.matchPassword(password);

        if (!isMatch) return res.status(400).json({ message: "Wrong Email and Password " });

        // create JWT PAYLOAD
        const payload = { user: { id: user._id, role: user.role } }

        // sign and return token along with user data
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "72h" }, (err, token) => {
            if (err) throw err;

            //send user data
            res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            })
        });

    } catch (error) {
        console.log(err)
        res.status(500).send("Server Error")
    }
})


//USER PROFILE ROUTE
router.get("/api/users/profile", protectProfileAccess, async(req, res) => {
    res.json(req.user)
})

module.exports = router;