const User = require('../models/User');
const Post = require('../models/Post');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const posts = await Post.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    // Get current user to check for old profile image
    const currentUser = await User.findById(req.session.userId);
    
    const updates = { ...req.body };
    if (req.file) {
      updates.profileImage = '/uploads/' + req.file.filename;
      
      // Delete old profile image if it exists and isn't the default
      if (currentUser.profileImage && currentUser.profileImage !== '/uploads/default-profile.jpg') {
        const oldImagePath = path.join(__dirname, '../../', currentUser.profileImage);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error('Error deleting old profile image:', err);
          }
        });
      }
    }
    
    const user = await User.findByIdAndUpdate(req.session.userId, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    const users = await User.find({
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, searchUsers, upload };
