const express = require("express");
const Product = require("../models/Product");
const { protectProfileAccess, adminAccess } = require("../middleware/authMiddleware")

const router = express.Router();

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



module.exports = router;