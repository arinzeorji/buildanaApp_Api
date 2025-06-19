const express = require("express");
const Cart = require("../models/Cart")
const Product = require("../models/Product")
const { protectProfileAccess, adminAccess } = require("../middleware/authMiddleware");

const router = express.Router();


//HELPER FUCNTION TO GET A CART BY USER ID OR GUEST ID
const getCart = async(userId, guestId) => {
    if (userId) {
        return await Cart.findOne({ user: userId })
    } else if (guestId) {
        return await Cart.findOne({ guestId })
    }
    return null;
}

//Public  POST request route for guest or loggedIn User
router.post("/api/cart", async(req, res) => {
    const { productId, quantity, size, color, guestId, userId } = req.body;

    try {
        const product = await Product.findById(productId);
        //check for Product ID
        if (!productId) return res.status(404).json({ message: "Product Not Found" })


        //check if User is Loggged In or Just a Guest
        let cart = await getCart(userId, guestId);

        if (cart) {
            const productIndex = cart.products.findIndex(
                (p) => p.productId.toString() === productId &&
                p.size === size &&
                p.color === color
            );

            if (productIndex > -1) {
                // if product already exist in cart, update the quantity
                cart.products[productIndex].quantity += quantity;
            } else {
                //add the new product to cart list
                cart.products.push({
                    productId,
                    name: product.name,
                    image: product.images[0].url,
                    price: product.price,
                    size,
                    color,
                    quantity,
                })
            }

            //calculate the total Price on the cart
            cart.totalPrice = cart.products.reduce((acc, item) => {
                acc + item.price * item.quantity,
                    0 //acumulator starts at 0
            });

            await cart.save();
            return res.status(200).json(cart);
        } else {
            //create a new cart for Guest User
            const newCart = await Cart.create({
                user: userId ? userId : undefined,
                guestId: guestId ? guestId : "guest_" + new Date().getTime(),
                products: [{
                    productId,
                    name: product.name,
                    image: product.images[0].url,
                    price: product.price,
                    size,
                    color,
                    quantity
                }],
                totalPrice: product.price * quantity,
            });

            return res.status(201).json(newCart);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
})

//UPDATE CART FOR USER OR GUEST
router.put("/api/cart", async(req, res) => {
    const { productId, quantity, size, color, guestId, userId } = req.body;

    try {
        let cart = await getCart(userId, guestId);

        if (!cart) return res.status(404).json({ message: "Cart Not Found" })

        const productIndex = cart.products.findIndex((p) =>
            p.productId.toString() === productId &&
            p.size === size &&
            p.color === color
        )

        if (productIndex > -1) {
            //update quantity
            if (quantity > 0) {
                cart.products[productIndex].qauntity = quantity;
            } else {
                //remove product form the cart if the quantity is below zero
                cart.products.splice(productIndex, 1);
            }

            //update total Price
            cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0)

            await cart.save();
            return res.status(200).json(cart);

        } else {
            res.status(404).json({ message: "Product Not Found in the Cart" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
})


// CART DELETING ROUTES
router.delete("/api/cart", async(req, res) => {
    const { productId, quantity, size, color, guestId, userId } = req.body;

    try {
        let cart = await getCart(userid, guestId);

        if (!cart) return res.status(404).json({ message: "Cart Not Found" })

        const productIndex = cart.products.findIndex(
            (p) => p.productId.toString() === productId &&
            p.size === size &&
            p.color === color
        );
        if (productIndex > -1) {
            cart.products.splice(productIndex, 1);

            cart.totalPrice = cart.products.reduce((acc, item) =>
                acc + item.price * item.quantity,
                0 //accumulator starter value
            );

            await cart.save();
            res.status(200).json(cart)
        } else {
            res.status(404).json({ message: "Product not found in cart for delete" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error for Delete Cart" })
    }
})


//GETTING THE CART ITEMS OF USERS
router.get("/api/cart", async(req, res) => {
    const { userId, guestId } = req.body;

    try {
        const cart = await getCart(userId, guestId);

        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ message: "Cart Not Found" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error for Getting Cart Items" })
    }
})

// MERGE GUEST CART TO USER CART AFTER LOGGING IN
router.post("/api/cart/merge", async(req, res) => {
    const { questId } = req.body;
    try {
        const guestCart = await Cart.findOne({ guestId })
        const userCart = await Cart.findOne({ user: req.user._id })

        if (guestCart) {
            if (guestCart.products.length === 0) {
                return res.status(400).json({ message: "Guest Cart is Empty" })
            }

            if (userCart) {
                //merge both guestCart and userCart
                guestCart.products.forEach((guestItem) => {
                    const productIndex = userCart.products.findIndex((item) => {
                        item.productId.toString() === guestItem.productId.toString() &&
                            item.size === guestItem.size &&
                            item.color === guestItem.color
                    });
                    if (productIndex > -1) {
                        //IF THE ITEM EXISTS IN THE USER CART, UPDATE THE QUANTITY
                        userCart.products[productIndex].quantity += guestItem.quantity;
                    } else {
                        //ADD THE GUEST ITEM TO THE CART
                        userCart.products.push(guestItem)
                    }
                });
                userCart.totalPrice = userCart.products.reduce((acc, item) => {
                    acc + item.price * item.quantity,
                        0
                })
                await Cart.save();

                //Remove the Guest Cart After Merging
                try {
                    await Cart.findOneAndDelete({ guestId })
                } catch (error) {
                    console.error("Error Deleting Guest Cart After Merging", error);
                }

                res.status(200).json(userCart);
            } else {
                //IF THE USER HAS NO EXISTING CART
                guestCart.user = req.user._id;
                guestCart.guestId = undefined;
                await guestCart.save();

                res.status(200).json(guestCart)
            }
        } else {
            if (userCart) {
                //IF GUEST HAS BEEN MERGED RETURN USERCART
                return res.status(200).json(userCart)
            }
            res.status(404).json({ message: "Guest Cart Not Found" });
        }

    } catch (error) {
        console.error(error)
        res.status(505).json({ message: "Server Error On Cart Merge Request" });
    }
})






















module.exports = router;