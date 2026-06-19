const User = require('../models/User');

const followUser = async (req, res) => {
  try {
    const currentUserId = req.session.userId;
    const targetUserId = req.params.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const index = currentUser.following.indexOf(targetUserId);
    if (index === -1) {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    } else {
      currentUser.following.splice(index, 1);
      const followerIndex = targetUser.followers.indexOf(currentUserId);
      targetUser.followers.splice(followerIndex, 1);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ message: 'Follow status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { followUser };
