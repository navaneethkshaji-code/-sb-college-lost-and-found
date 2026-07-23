const mongoose = require('mongoose');

const HandoverReportSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  postTitle: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  finder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receivedDate: {
    type: Date,
    default: Date.now
  },
  receiptNo: {
    type: String,
    unique: true,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  verificationCode: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HandoverReport', HandoverReportSchema);
