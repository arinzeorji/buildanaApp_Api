const mongoose = require("mongoose")

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, },
    price: { type: Number, required: true, },
    discountPrize: { type: Number },
    countInStock: { type: Number, required: true, dafault: 0, },
    category: { type: String, required: true, },
    brand: { type: String, required: true },
    sizes: { type: [String], required: true, },
    colors: { type: [String], required: true },
    collections: { type: String, required: true },
    material: { type: String },
    gender: { type: String, enum: ["Men", "Women"] },
    images: [{ url: { type: String, required: true, } }],
    isFeature: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    noOfReviews: { type: Number, default: false },
    tags: [String],
    sku: { type: String, unique: true, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    metaTitle: { type: String, },
    metaDescription: { type: String },
    metaKeyword: { type: String },
    dimensions: { length: Number, width: Number, height: Number, weight: Number },
}, { timestamps: true });

module.exports = mongoose.model("Products", ProductSchema);