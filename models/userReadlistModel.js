const mongoose = require('mongoose');

const UserReadlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
    },
    status: {
        type: String,
        enum: ['to_read', 'reading', 'completed'],
        default: 'to_read',
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});

UserReadlistSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('UserReadlist', UserReadlistSchema);
