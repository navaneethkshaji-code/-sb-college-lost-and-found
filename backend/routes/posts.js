const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Post = require('../models/Post');
const HandoverReport = require('../models/HandoverReport');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Multer Storage Configuration for File Uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG, and WEBP image uploads are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @desc    Get all lost and found posts with query filters
// @route   GET /api/posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, category, location, search } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await Post.find(query)
      .populate('reporter', 'username email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get a single post details with matching items logic
// @route   GET /api/posts/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('reporter', 'username email phone avatar')
      .populate('resolvedWith');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post report not found' });
    }

    // Automatic AI/Correlative Matching Logic
    // Find active posts with opposite status, same category, and similar title keywords or location
    const titleKeywords = post.title
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3); // Filter out short words like 'the', 'for'

    const searchRegexList = titleKeywords.map(word => ({
      title: { $regex: word, $options: 'i' }
    }));

    let matchConditions = {
      _id: { $ne: post._id },
      status: post.status === 'lost' ? 'found' : 'lost',
      category: post.category,
      resolved: false
    };

    if (searchRegexList.length > 0) {
      matchConditions.$or = [
        ...searchRegexList,
        { location: { $regex: post.location, $options: 'i' } }
      ];
    } else {
      matchConditions.location = { $regex: post.location, $options: 'i' };
    }

    const matchingPosts = await Post.find(matchConditions)
      .populate('reporter', 'username email avatar')
      .limit(5);

    res.json({
      success: true,
      data: post,
      matches: matchingPosts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a new report post (Lost or Found)
// @route   POST /api/posts
// @access  Private
router.post('/', protect, upload.single('photo'), async (req, res) => {
  try {
    const { title, description, category, date, location, status, imageUrl } = req.body;

    let finalImageUrl = imageUrl || '';

    // If file is uploaded, construct path url
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const post = await Post.create({
      title,
      description,
      category,
      date,
      location,
      status,
      imageUrl: finalImageUrl || 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=600&auto=format&fit=crop&q=80',
      reporter: req.user._id
    });

    const populatedPost = await Post.findById(post._id).populate('reporter', 'username email avatar');

    res.status(201).json({ success: true, data: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a post details
// @route   PUT /api/posts/:id
// @access  Private
router.put('/:id', protect, upload.single('photo'), async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post report not found' });
    }

    // Verify ownership
    if (post.reporter.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to modify this report' });
    }

    // Prepare fields to update
    const updateData = { ...req.body };
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    post = await Post.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('reporter', 'username email avatar');

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post report not found' });
    }

    // Verify ownership
    if (post.reporter.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this report' });
    }

    await post.deleteOne();
    res.json({ success: true, message: 'Post report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// SECURE IN-APP MESSAGING SUB-ROUTES
// ==========================================

// @desc    Send a message regarding an item post
// @route   POST /api/posts/:id/messages
// @access  Private
router.post('/:id/messages', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const { receiverId, text } = req.body;
    if (!receiverId || !text) {
      return res.status(400).json({ success: false, message: 'Please provide receiverId and text' });
    }

    const newMessage = {
      sender: req.user._id,
      receiver: receiverId,
      text
    };

    post.messages.push(newMessage);
    await post.save();

    res.status(201).json({ success: true, data: post.messages[post.messages.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get messages thread regarding an item post
// @route   GET /api/posts/:id/messages
// @access  Private
router.get('/:id/messages', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('messages.sender', 'username avatar')
      .populate('messages.receiver', 'username avatar');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Filter messages: only show messages exchanged between the logged-in user and other participants
    const userMessages = post.messages.filter(
      msg =>
        msg.sender._id.toString() === req.user._id.toString() ||
        msg.receiver._id.toString() === req.user._id.toString()
    );

    res.json({ success: true, data: userMessages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
