const Comment = require('../models/Comment');

const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: 1 }).populate('userId', '-password');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const newComment = new Comment({
      postId: req.params.postId,
      userId: req.session.userId,
      comment
    });
    await newComment.save();
    const populatedComment = await Comment.findById(newComment._id).populate('userId', '-password');
    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.userId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getComments, createComment, deleteComment };
