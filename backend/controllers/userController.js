const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

const userLogin = async (req, res) => {
    try {
        const { email, userid, password } = req.body;

   

        // Check if either email or userid is provided
        if (!email && !userid) {
            return res.status(400).json({ msg: "Please provide either email or user ID" });
        }

        // Find user by email or userid
        let user;
        if (email) {
            user = await UserModel.findOne({ email });
        } else if (userid) {
            user = await UserModel.findOne({ userid });
        }

        // If user not found
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: "Invalid credentials" });
        }

        // You can generate a JWT token here if you are using authentication tokens
        // const token = user.generateAuthToken(); // Assuming you have a method to generate a token

        return res.status(200).json({
            msg: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                userid: user.userid,
                // token, // Include the token if needed
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ msg: "Something went wrong", error: error.message });
    }
}

module.exports = {
    userLogin,
};
