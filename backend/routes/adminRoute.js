const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middlewares/upload');
const verifyToken = require('../middlewares/verifyToken');

// public login (admin modal)
router.post('/login', adminController.adminLogin);

// protected admin actions (only admin should call these from frontend - you can check role in controller if needed)
router.post('/create-user', verifyToken, upload.single('image'), adminController.userCreation);
router.get('/user-display', verifyToken, adminController.userDisplay);
router.put('/user-update/:id', verifyToken, upload.single('image'), adminController.userUpdate);
router.delete('/user-delete/:id', verifyToken, adminController.userDelete);

module.exports = router;
