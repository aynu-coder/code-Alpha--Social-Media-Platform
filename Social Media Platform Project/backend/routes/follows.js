const express = require('express');
const router = express.Router();
const { followUser } = require('../controllers/followController');
const { isAuthenticated } = require('../middleware/auth');

router.post('/:id', isAuthenticated, followUser);

module.exports = router;
