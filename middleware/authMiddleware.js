const jwt = require("jsonwebtoken")
const User = require("../models/User")

const protectProfileAccess = async(req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.user.id).select("-password") //exclude password
        } catch (error) {
            console.error("Token Verification Failed", error);
            res.status(401).json({ message: "Not Authorized, Token Failed" })

        }
    } else {
        res.status(401).json({ message: "Not Authorized, No Token Provided" })
    }
}

// middleware to ensure that only admins can add products
const adminAccess = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Not Authorized as an Admin" })
    }

}


module.exports = { protectProfileAccess, adminAccess }