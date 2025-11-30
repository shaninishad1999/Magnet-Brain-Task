const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    password: { type: String, default: "" },
    adminProfile: { type: String, default: "" },
   
});

const adminModel = mongoose.model("Admin", adminSchema);
module.exports = adminModel;
