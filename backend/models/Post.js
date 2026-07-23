const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an item title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a detailed description']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: ['electronics', 'keys', 'wallet', 'documents', 'clothing', 'pets', 'others']
  },
  date: {
    type: Date,
    required: [true, 'Please select the date when the item was lost or found']
  },
  location: {
    type: String,
    required: [true, 'Please add the last known location']
  },
  status: {
    type: String,
    required: [true, 'Please specify status as lost or found'],
    enum: ['lost', 'found']
  },
  imageUrl: {
    type: String,
    default: ''
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HandoverReport',
    default: null
  },
  messages: [MessageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);
