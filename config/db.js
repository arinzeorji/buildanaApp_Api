const mongoose = require("mongoose");

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connection sucessful")
    } catch (error) {
        console.error("Database Connection failed, ");
        process.exit();
    }
};

module.exports = connectDB;