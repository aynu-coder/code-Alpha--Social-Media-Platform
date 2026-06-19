const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const postData = {
      userId: req.session.userId,
      content
    };
    if (req.file) {
      postData.image = '/uploads/' + req.file.filename;
    }
    const newPost = new Post(postData);
    await newPost.save();
    const populatedPost = await Post.findById(newPost._id).populate('userId', '-password');
    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentsCount: { $size: '$comments' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId'
        }
      },
      { $unwind: '$userId' },
      {
        $project: {
          'userId.password': 0,
          comments: 0
        }
      }
    ]);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFeedPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.userId);
    const following = [...currentUser.following, req.session.userId];
    const posts = await Post.aggregate([
      { $match: { userId: { $in: following } } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentsCount: { $size: '$comments' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId'
        }
      },
      { $unwind: '$userId' },
      {
        $project: {
          'userId.password': 0,
          comments: 0
        }
      }
    ]);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const updates = { ...req.body };
    if (req.file) {
      updates.image = '/uploads/' + req.file.filename;
    }
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('userId', '-password');
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (post.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Delete the image file if it exists
    if (post.image) {
      const imagePath = path.join(__dirname, '../../', post.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image file:', err);
        }
      });
    }
    
    await Comment.deleteMany({ postId: post._id });
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSinglePost = async (req, res) => {
  try {
    const [post] = await Post.aggregate([
      { $match: { _id: new require('mongoose').Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentsCount: { $size: '$comments' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId'
        }
      },
      { $unwind: '$userId' },
      {
        $project: {
          'userId.password': 0,
          comments: 0
        }
      }
    ]);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const userId = req.session.userId;
    const index = post.likes.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }
    await post.save();
    
    const [updatedPost] = await Post.aggregate([
      { $match: { _id: post._id } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'postId',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentsCount: { $size: '$comments' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId'
        }
      },
      { $unwind: '$userId' },
      {
        $project: {
          'userId.password': 0,
          comments: 0
        }
      }
    ]);
    
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createPost, getPosts, getFeedPosts, getSinglePost, updatePost, deletePost, likePost, upload };
