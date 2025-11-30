const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/connectDB");
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const taskRoutes = require('./routes/taskRoutes');
const bodyParser = require("body-parser");

dotenv.config(); // Load environment variables from .env file

// Connect to MongoDB
connectDB(); 

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/user", userRoute);
app.use("/admin", adminRoute);
app.use('/tasks', taskRoutes);
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
