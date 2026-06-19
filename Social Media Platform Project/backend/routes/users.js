const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, searchUsers, upload } = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/search', isAuthenticated, searchUsers);
router.get('/:id', isAuthenticated, getUserProfile);
router.put('/', isAuthenticated, upload.single('profileImage'), updateUserProfile);

module.exports = router;
