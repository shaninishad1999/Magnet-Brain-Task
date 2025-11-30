const nodemailer = require("nodemailer");
require("dotenv").config();
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_HOST,
        pass: process.env.EMAIL_PASSWORD // Consider moving this to environment variables
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Error connecting to email service:", error);
    } else {
        console.log("Email service ready to send messages");
    }
});

module.exports = transporter;
