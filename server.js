const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
// const bodyParser = require('body-parser')
const connect = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");

const app = express();
app.use(express.json());

app.use(cors());
dotenv.config();

//conect to database
connect();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("WELCOME TO BACKEND API")
});


// API ROUTES
app.use(userRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use(checkoutRoutes);
app.use(uploadRoutes);
app.use(subscriberRoutes);
app.use(orderRoutes);

//ADMIN ROUTES
app.use(adminRoutes);
app.use(adminOrderRoutes);
app.use(adminProductRoutes);

app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
})