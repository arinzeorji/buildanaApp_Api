const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product")
const User = require("./models/User")
const Cart = require("./models/Cart")
const products = require("./data/products");

dotenv = config();

//connect to database
mongoose.connect(process.env.MONGO_URL);

//Function to pupolate data
const seedData = async() => {
    try {
        //Clear All Existing Data
        await Product.deleteMany();
        await User.deleteMany();
        await Cart.deleteMany();

        //create a default Admin User
        const createAdminUser = await User.create({
            name: "Admin User",
            email: "admin@gmail.com",
            password: "Admin1234",
            role: "admin"
        });

        //Get New User ID
        const adminID = createAdminUser._id;

        //Asign A Default ID to Each PRoducts
        const sampleProducts = products.map((product) => {
            return {...product, user: adminID }
        })

        //save products to the database
        await Product.insertMany(sampleProducts);

        console.log("Products inserted Succeffully");
        process.exit();


    } catch (error) {
        console.error("Error Encountered Seeding Data, ", error);
        process.exit(1);
    }
}

seedData();