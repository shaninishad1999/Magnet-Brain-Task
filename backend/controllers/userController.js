const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userLogin = async (req, res) => {
  try {
    const { email, userid, password } = req.body;

    if (!email && !userid) {
      return res.status(400).json({ msg: "Please provide either email or user ID" });
    }

    let user;
    if (email) user = await UserModel.findOne({ email });
    else user = await UserModel.findOne({ userid });

    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    // Issue JWT (basic)
    const token = jwt.sign(
      { id: user._id.toString(), role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      msg: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userid: user.userid,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ msg: "Something went wrong", error: error.message });
  }
};

module.exports = { userLogin };
