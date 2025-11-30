const adminModel = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel"); // Make sure this exists
const passGen = require("../middlewares/passwordGenerator");
const bcrypt = require("bcryptjs");
const transporter = require("../utils/emailTransporter"); // ✅ Importing the transporter
const taskModel = require("../models/taskModel");
require("dotenv").config();


const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    // Create JWT
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      msg: "Login successful",
      token,
      admin: {
        name: admin.name,
        email: admin.email,
        profile: admin.adminProfile,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ msg: "Something went wrong" });
  }
};
const userCreation = async (req, res) => {
  
  
  try {
    const { name, email, phone, userid, role, image, department } = req.body;
    
    // Check if user with this email already exists
    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
        field: "email"
      });
    }
    
    // Check if user with this userid already exists
    const existingUserid = await UserModel.findOne({ userid });
    if (existingUserid) {
      return res.status(400).json({
        success: false,
        message: "User with this user ID already exists.",
        field: "userid"
      });
    }
    
    // Generate password and hash
    const myPass = passGen();
    const hashedPassword = await bcrypt.hash(myPass, 10);
    
    // Create user
    const newUser = await UserModel.create({
      name,
      email,
      phone,
      userid,
      role,
      department,
      image: req.file ? req.file.path : "", // path from multer
      password: hashedPassword,
    });
    
  const mailOptions = {
  from: process.env.EMAIL_HOST,
  to: email,
  subject: "Your Company Work Detail Account",
  text:
    `Dear ${name},\n\n` +
    `Welcome! Your account has been successfully created in our system.\n\n` +
    `Your login credentials:\n` +
    `---------------------------\n` +
    `User ID: ${userid}\n` +
    `Email: ${email}\n` +
    `Password: ${myPass}\n` +
    `---------------------------\n\n` +
    `Please log in using your email and the provided temporary password.\n` +
    `For security purposes, we recommend changing your password after your first login.\n\n` +
    `Click below to open the login page:\n` +
    `http://localhost:5173/\n\n` +   // ✅ ADD THIS
    `If you have any questions, please contact our support team.\n\n` +
    `Best Regards,\n` +
    `The Admin Team`,
};

    
    // Send email
    await transporter.sendMail(mailOptions);
    
    res.status(201).json({
      success: true,
      message: "User created and email sent successfully.",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

const userDisplay = async (req, res) => {
  try {
    const users = await UserModel.find({}).select("-password"); // Exclude password from the response
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

const userUpdate = async (req, res) => {

  const { id } = req.params;
  const { name, email, phone, userid, role, department } = req.body;

  try {
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    existingUser.name = name || existingUser.name;
    existingUser.email = email || existingUser.email;
    existingUser.phone = phone || existingUser.phone;
    existingUser.userid = userid || existingUser.userid;
    existingUser.role = role || existingUser.role;
    existingUser.department = department || existingUser.department;

    if (req.file) {
      existingUser.image = req.file.path;
    }

    await existingUser.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: existingUser,
    });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};

const userDelete = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const deleteQuery = {
      $or: [
        { assignee: id }, // assignee: ObjectId
        { "assignee._id": id }, // assignee: { _id: ObjectId, name: ... }
        { createdBy: id }, // tasks created by this user
      ],
    };

    // Count how many tasks match (optional but useful for response)
    const tasksToDeleteCount = await taskModel.countDocuments(deleteQuery);

    if (tasksToDeleteCount > 0) {
      await taskModel.deleteMany(deleteQuery);
    }

    // 2) Delete the user
    await UserModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      tasksDeleted: tasksToDeleteCount,
    });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
};


const TaskRecive = async (req, res) => {
  try {
    const response = await UserModel.find();
    res.status(200).send(response);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  adminLogin,
  userCreation,
  userDisplay,
  userUpdate,
  userDelete,
  TaskRecive,
};
