const express = require('express');
const router = express.Router();
const { createPost, getPosts, getFeedPosts, getSinglePost, updatePost, deletePost, likePost, upload } = require('../controllers/postController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, getPosts);
router.get('/feed', isAuthenticated, getFeedPosts);
router.get('/:id', isAuthenticated, getSinglePost);
router.post('/', isAuthenticated, upload.single('image'), createPost);
router.put('/:id', isAuthenticated, upload.single('image'), updatePost);
router.delete('/:id', isAuthenticated, deletePost);
router.post('/:id/like', isAuthenticated, likePost);

module.exports = router;
