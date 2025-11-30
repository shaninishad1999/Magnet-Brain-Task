const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const upload = require('../middlewares/upload');
// ✅ Admin login route
router.post("/login", adminController.adminLogin);

// ✅ User creation route
router.post('/create-user', upload.single('image'), adminController.userCreation);
router.get("/user-display", adminController.userDisplay);
router.put("/user-update/:id", upload.single('image'), adminController.userUpdate);
router.delete("/user-delete/:id", adminController.userDelete);


module.exports = router;
