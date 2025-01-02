const mongoose = require('mongoose');

const ForumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
      type: String,
      default: '',
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    views: {
        type: Number,
        default: 0,
    },
    comments: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model('Forum', ForumSchema);
