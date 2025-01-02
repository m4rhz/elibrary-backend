const Forum = require('../models/forumModel');
const ForumComment = require('../models/forumCommentModel');

const index = async (req, res) => {
    try {
        const forums = await Forum.find().populate('author').sort({ createdAt: -1 }); // Gunakan createdAt untuk sorting terbaru
        res.status(200).json(forums);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching forums', error: error.message });
    }
};

const show = async (req, res) => {
    try {
        const forum = await Forum.findById(req.params.id).populate('author');

        if (!forum) {
            return res.status(404).json({ message: 'Forum not found' });
        }

        res.status(200).json(forum);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid forum ID' });
        }
        res.status(500).json({ message: 'Error fetching forum', error: error.message });
    }
};

const store = async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'Title and Author are required' });
    }

    try {
        const newForum = new Forum({
            title,
            author: req.user.userId,
            description: description || '',
        });
        await newForum.save();

        res.status(201).json(newForum);
    } catch (error) {
        res.status(500).json({ message: 'Error creating forum', error: error.message });
    }
};

const update = async (req, res) => {
    const { title, description } = req.body;

    try {
        const forum = await Forum.findById(req.params.id);

        if (!forum) {
            return res.status(404).json({ message: 'Forum not found' });
        }

        if (title) forum.title = title;
        if (description) forum.description = description;

        const updatedForum = await forum.save();
        res.status(200).json(updatedForum);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid forum ID' });
        }
        res.status(500).json({ message: 'Error updating forum', error: error.message });
    }
};

const destroy = async (req, res) => {
    try {
        const forum = await Forum.findByIdAndDelete(req.params.id);

        if (!forum) {
            return res.status(404).json({ message: 'Forum not found' });
        }

        res.status(200).json({ message: 'Forum deleted successfully' });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid forum ID' });
        }
        res.status(500).json({ message: 'Error deleting forum', error: error.message });
    }
};

const getComment = async (req, res) => {
    const { id } = req.params;
    try {
        const comments = await ForumComment.find({ forum: id })
            .populate('author', 'username email')
            .sort({ created_at: -1 });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching comments' });
    }
}

const storeComment = async (req, res) => {
    const { id: forum } = req.params;
    const { userId: author } = req.user;
    const { message } = req.body;
    try {
        if (!author || !forum || !message) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newComment = await ForumComment.create({ author, forum, message });
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ error: 'Error creating comment' });
    }
}

module.exports = {
    index,
    show,
    store,
    update,
    destroy,
    getComment,
    storeComment
};
