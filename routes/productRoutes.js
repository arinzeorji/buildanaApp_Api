const express = require("express")
const Product = require("../models/Product");
const { protectProfileAccess, adminAccess } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/api/products", protectProfileAccess, adminAccess, async(req, res) => {

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

        const product = new Product({
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
            sku,
            user: req.user._id // reference to the admin user or publisher
        })

        const createdProduct = await Product.save()
        res.status(201).json(createdProduct)

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error")
    }
})


//PRODUCT UPDATE ROUTE WITH PRODUCT ID
router.put("/api/products/:id", protectProfileAccess, adminAccess, async(req, res) => {
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


//DELETING PRODUCTS by id
router.delete("/api/products/:id", protectProfileAccess, adminAccess, async(req, res) => {
    try {
        //Find the Products
        const product = await Product.findById(req.params.id);

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

// products route to GET AND SORT PRODUCTS BASED ON USER PREFERENCES
router.get("/api/products", async(req, res) => {
    try {
        const {
            collection,
            size,
            color,
            gender,
            minPrice,
            maxPrice,
            sortBy,
            search,
            category,
            material,
            brand,
            limit
        } = req.query;

        //FILTER LOGIC
        if (collection && collection.toLocaleLowerCase() !== "all") {
            req.query.collections = collection;
        }

        if (category && category.toLocaleLowerCase() !== "all") {
            req.query.category = category;
        }

        if (material) {
            req.query.material = { $in: material.split(", ") };
        }

        if (brand) {
            req.query.brand = { $in: brand.split(", ") };
        }

        if (size) {
            req.query.sizes = { $in: size.split(", ") };
        }

        if (color) {
            req.query.colors = { $in: [color] };
        }

        if (gender) {
            req.query.gender = gender;
        }

        if (minPrice || maxPrice) {
            req.query.price = {};
            if (minPrice) req.query.price.$gte = Number(minPrice)
            if (maxPrice) req.query.price.$lte = Number(maxPrice)
        }

        if (search) {
            req.query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        //if
        let sort = {};
        if (sortBy) {
            switch (sortBy) {
                case "priceAsc":
                    sort = { price: 1 };
                    break;
                case "priceDesc":
                    sort = { price: -1 };
                    break;
                case "popularity":
                    sort = { rating: -1 };
                    break;
                default:
                    break;
            }
        }

        //Fetch Products
        let products = await Product.find(req.query)
            .sort(sort).limit(Number(limit || 0));
        res.json(products);


    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Serval Error")
    }
})

// Frequently bought items BEST SELLER
router.get("/api/products/bestseller", async(req, res) => {
    try {
        const bestSeller = await Product.findOne({ sku: "REG-HEN-008" });
        if (bestSeller) {
            res.json(bestSeller)
        } else {
            res.status(404).json({ message: "No best Seller Found" });
        }

    } catch (error) {

        res.status(500).send("Server Error");
    }
})

//New Arrival Routes sort with most recent date and limit to only 8 products
router.get("/api/products/new-arrivals",
    async(req, res) => {
        try {
            const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);
            if (newArrivals) {
                res.json(newArrivals);
            } else {
                res.status(400).json({ message: "No New Arrivals Found" })
            }
        } catch (error) {
            res.status(500).send("Server Error");
        }
    })

//SINGLE PRODUCTS by id
router.get("/api/products/:id", async(req, res) => {
    try {
        //Find the Products
        const product = await Product.findById(req.params.id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: "Product not Found" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error")
    }
})

// Route to get similar Products to a product
router.get("/api/products/similar/:id", async(req, res) => {
    try {

        //get product id from the url parameter
        const { id } = req.params;

        //find the product
        const product = await Product.findById(id);

        if (!product) { //if not found
            return res.status(404).json({ message: "Product Not Found" })
        }

        //Get Similar Products Excludimg the Current Product with Limit of 4 products
        const similarProducts = await Product.find({
            _id: { $ne: id },
            gender: product.gender,
            category: product.category
        }).limit(4);

        res.json(similarProducts);

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error")
    }
})




module.exports = router;