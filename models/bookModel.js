const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    cover: {
        type: String,
        required: true,
        trim: true,
    },
    synopsys: {
        type: String,
        trim: true,
    },
    information: {
        author: {
            type: String,
            required: true,
            trim: true,
        },
        publisher: {
            type: String,
            required: true,
            trim: true,
        },
        publicationYear: {
            type: Number,
            required: true,
        },
        theme: {
            type: [String],
            default: [],
        },
        genre: {
            type: [String],
            default: [],
        },
        demographic: {
            type: String,
            trim: true,
        },
        pageCount: {
            type: Number,
            min: 1,
        },
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
});

module.exports = mongoose.model('Book', bookSchema);
