const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();



router.get('/register', userController.RegsitrationForm);
router.post('/register', userController.user_upload.single('user_image'), userController.registerUser);
router.get('/login', userController.LoginForm);
router.post('/login', userController.loginUser);
router.get('/profile', userController.showUserProfile);
router.get('/logout', userController.logout);
router.get('/user_profile', userController.UserProfile);
router.get('/save_jobs', userController.saveUserJobs);

module.exports = router;