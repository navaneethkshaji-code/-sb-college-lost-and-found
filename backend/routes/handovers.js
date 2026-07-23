const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const HandoverReport = require('../models/HandoverReport');
const { protect } = require('../middleware/auth');

// @desc    Resolve a post and generate a Handover Report Receipt
// @route   POST /api/handovers/resolve/:postId
// @access  Private
router.post('/resolve/:postId', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post report not found' });
    }

    if (post.resolved) {
      return res.status(400).json({ success: false, message: 'This report has already been resolved' });
    }

    // Verify user authorization: only the reporter of the post can resolve it
    if (post.reporter.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to resolve this report' });
    }

    const { partnerId, notes } = req.body;
    if (!partnerId) {
      return res.status(400).json({ success: false, message: 'Please specify the handover partner user ID' });
    }

    // Establish Owner & Finder based on who reported what status
    // If original post is "lost": reporter is owner, partner is finder
    // If original post is "found": reporter is finder, partner is owner
    const isOwner = post.status === 'lost';
    const ownerId = isOwner ? post.reporter : partnerId;
    const finderId = isOwner ? partnerId : post.reporter;

    // Generate unique verification details
    const receiptNo = 'REC-' + Math.floor(100000 + Math.random() * 900000);
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Create Handover Report
    const report = await HandoverReport.create({
      post: post._id,
      postTitle: post.title,
      owner: ownerId,
      finder: finderId,
      receiptNo,
      notes: notes || 'No custom verification notes added.',
      verificationCode
    });

    // Update original post status
    post.resolved = true;
    post.resolvedWith = report._id;
    await post.save();

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get details of a Handover Receipt
// @route   GET /api/handovers/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await HandoverReport.findById(req.params.id)
      .populate('owner', 'username email phone avatar')
      .populate('finder', 'username email phone avatar')
      .populate('post', 'title status location date');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Handover report not found' });
    }

    // Authorization: only the owner, finder or original post reporter can query this receipt
    const hasAccess =
      report.owner._id.toString() === req.user._id.toString() ||
      report.finder._id.toString() === req.user._id.toString();

    if (!hasAccess) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this receipt record' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all handovers for the logged-in user
// @route   GET /api/handovers
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const reports = await HandoverReport.find({
      $or: [
        { owner: req.user._id },
        { finder: req.user._id }
      ]
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
