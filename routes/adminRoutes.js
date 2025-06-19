const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
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


//ADMIN PRODUCT ROUTES TO GET, POST, PUT AND DELETE PRODUCTS
router.get("/api/admin/products", protectProfileAccess, adminAccess, async(req, res) => {
    try {
        const products = await Product.find({});

        if (!products) {
            return res.status(404).json({ message: "No Products Found" })
        }
        res.json(products)
    } catch (error) {
        console.error(object);
        res.status(500).json({ message: "Server Error" })
    }
})

//ADMIN PUT REQUEST ROUTES FOR PRODUCTS
router.put("/api/admin/products/:id", protectProfileAccess, adminAccess, async(req, res) => {
    try {
        const {
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku
        } = req.body;

        //FIND THE PRODUCT IN THE URL
        const product = await Product.findById(req.params.id);

        if (product) {
            // UPDATE THE PRODUCT DETAILS WITH UPDATED DETAILS
            product.name = name || product.name
            product.description = description || product.description
            product.price = price || product.price
            product.discountPrice = discountPrice || product.discountPrice
            product.countInsStock = countInsStock || product.countInsStock
            product.category = category || product.category
            product.brand = brand || product.brand
            product.sizes = sizes || product.sizes
            product.colors = colors || product.colors
            product.collections = collections || product.collections
            product.materials = materials || product.materials
            product.gender = gender || product.gender
            product.images = images || product.images
            product.isFeatured = isFeatured !== undefined ?
                isFeatured : product.isFeatured
            product.isPublished = isPublished !== undefined ?
                isPublished : product.isPublished
            product.tags = tags || product.tags
            product.dimensions = dimensions || product.dimensions
            product.weights = weights || product.weights
            product.sku = sku || product.sku

            //save the updated products to the database
            const updatedProducts = await Product.save();
            res.json(updatedProducts);
        } else {
            res.status(404).json({ message: "Product no found" })
        }

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
})


//ADMIN DELETING PRODUCTS by id
router.delete("/api/admin/products/:id", protectProfileAccess, adminAccess, async(req, res) => {
    try {
        //Find the Products
        const product = Product.findById(req.params.id);

        if (product) {
            //delete if found
            await product.deleteOne();
            res.json({ message: "Product Deleted Successfully" })
        } else {
            res.status(404).json({ message: "Product not Found" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error")
    }
})

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