const express = require('express');
const router = express.Router();
const { getComments, createComment, deleteComment } = require('../controllers/commentController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/:postId', isAuthenticated, getComments);
router.post('/:postId', isAuthenticated, createComment);
router.delete('/:id', isAuthenticated, deleteComment);

module.exports = router;
