const Book = require('../models/bookModel');
const BookReview = require('../models/bookReviewModel');
const UserReadlist = require('../models/userReadlistModel');
const mongoose = require('mongoose');

const index = async (req, res) => {
    const { userId } = req.user || {}

    try {
        const books = await Book.aggregate([
            {
                $lookup: {
                    from: 'bookreviews',
                    let: { bookId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$book', '$$bookId'] }, { $eq: ['$user', new mongoose.Types.ObjectId(userId)] }] } } },
                        { $project: { _id: 0, rate: 1, review: 1 } }
                    ],
                    as: 'user_review',
                },
            },
            {
                $lookup: {
                    from: 'bookreviews', // Koleksi bookreviews
                    let: { bookId: '$_id' }, // Variabel lokal 'bookId'
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$book', '$$bookId'] // Mencocokkan ID buku
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'users', // Koleksi users
                                localField: 'user', // Field user pada bookreviews
                                foreignField: '_id', // Field _id pada users
                                as: 'user' // Menambahkan detail user
                            }
                        },
                        {
                            $unwind: '$user' // Membuka array user_details menjadi objek
                        },
                        {
                            $project: {
                                _id: 0, // Menghilangkan '_id'
                                rate: 1, // Menyertakan 'rate'
                                review: 1, // Menyertakan 'review'
                                created_at: 1,
                                updated_at: 1,
                                'user._id': 1, // ID user
                                'user.username': 1, // Nama user
                                'user.email': 1 // Email user (opsional jika dibutuhkan)
                            }
                        }
                    ],
                    as: 'user_reviews' // Hasil lookup disimpan di 'user_reviews'
                }
            },
            {
                $lookup: {
                    from: 'userreadlists',
                    let: { bookId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$book', '$$bookId'] }, { $eq: ['$user', new mongoose.Types.ObjectId(userId)] }] } } },
                        { $project: { _id: 0, status: 1 } }
                    ],
                    as: 'user_readlist',
                },
            },
            {
                $addFields: {
                    user_readlist: { $arrayElemAt: ['$user_readlist', 0] },
                    user_review: { $arrayElemAt: ['$user_review', 0] },
                },
            },
            {
                $sort: { created_at: -1 },
            },
        ]);
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books', error: error.message });
    }
};

const getReadlist = async (req, res) => {
    const { userId } = req.user
    try {
        const readlist = await UserReadlist.find({ user: userId })
            .populate('book')
            .select('book');

        res.status(200).json(readlist.map(item => item.book));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching books', error: error.message });
    }
}

const show = async (req, res) => {
    const { userId } = req.user || {}

    try {
        const books = await Book.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(req.params.id) }
            },
            {
                $lookup: {
                    from: 'bookreviews',
                    let: { bookId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$book', '$$bookId'] }, { $eq: ['$user', new mongoose.Types.ObjectId(userId)] }] } } },
                        { $project: { _id: 0, rate: 1, review: 1 } }
                    ],
                    as: 'user_review',
                },
            },
            {
                $lookup: {
                    from: 'bookreviews', // Koleksi bookreviews
                    let: { bookId: '$_id' }, // Variabel lokal 'bookId'
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$book', '$$bookId'] // Mencocokkan ID buku
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'users', // Koleksi users
                                localField: 'user', // Field user pada bookreviews
                                foreignField: '_id', // Field _id pada users
                                as: 'user' // Menambahkan detail user
                            }
                        },
                        {
                            $unwind: '$user' // Membuka array user_details menjadi objek
                        },
                        {
                            $project: {
                                _id: 0, // Menghilangkan '_id'
                                rate: 1, // Menyertakan 'rate'
                                review: 1, // Menyertakan 'review'
                                created_at: 1,
                                updated_at: 1,
                                'user._id': 1, // ID user
                                'user.username': 1, // Nama user
                                'user.email': 1, // Email user (opsional jika dibutuhkan),
                                'user.profileImage': 1
                            }
                        }
                    ],
                    as: 'user_reviews' // Hasil lookup disimpan di 'user_reviews'
                }
            },
            {
                $lookup: {
                    from: 'userreadlists',
                    let: { bookId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $and: [{ $eq: ['$book', '$$bookId'] }, { $eq: ['$user', new mongoose.Types.ObjectId(userId)] }] } } },
                        { $project: { _id: 0, status: 1 } }
                    ],
                    as: 'user_readlist',
                },
            },
            {
                $addFields: {
                    user_readlist: { $arrayElemAt: ['$user_readlist', 0] },
                    user_review: { $arrayElemAt: ['$user_review', 0] },
                },
            },
        ]);

        const book = books[0]

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json(book);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid book ID' });
        }
        res.status(500).json({ message: 'Error fetching book', error: error.message });
    }
};

const store = async (req, res) => {
    const { title, cover, synopsys, information } = req.body;

    if (!title || !cover || !information || !information.author || !information.publisher || !information.publicationYear) {
        return res.status(400).json({ message: 'Title, cover, and complete information (author, publisher, publicationYear) are required' });
    }

    try {
        const newBook = new Book({
            title,
            cover,
            synopsys: synopsys || '',
            information,
        });
        await newBook.save();

        res.status(201).json(newBook);
    } catch (error) {
        res.status(500).json({ message: 'Error creating book', error: error.message });
    }
};

const update = async (req, res) => {
    const { title, cover, synopsys, information } = req.body;

    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (title) book.title = title;
        if (cover) book.cover = cover;
        if (synopsys) book.synopsys = synopsys;
        if (information) book.information = { ...book.information, ...information };

        const updatedBook = await book.save();
        res.status(200).json(updatedBook);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid book ID' });
        }
        res.status(500).json({ message: 'Error updating book', error: error.message });
    }
};

const destroy = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid book ID' });
        }
        res.status(500).json({ message: 'Error deleting book', error: error.message });
    }
};

const addOrUpdateReview = async (req, res) => {
    const { rate, review } = req.body;
    const { id: bookId } = req.params;
    const { userId } = req.user;

    if (!rate || rate < 1 || rate > 5) {
        return res.status(400).json({ message: 'Rate harus antara 1 dan 5' });
    }
    if (!review || review.trim() === '') {
        return res.status(400).json({ message: 'Review tidak boleh kosong' });
    }

    try {
        const result = await BookReview.updateOne(
            { book: bookId, user: userId },
            { rate, review },
            { upsert: true }
        );

        if (result.upserted) {
            return res.status(201).json({ message: 'Review berhasil ditambahkan' });
        } else {
            return res.status(200).json({ message: 'Review berhasil diperbarui' });
        }
    } catch (error) {
        console.error('Error updating or adding review:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan review', error: error.message });
    }
};

const removeReview = async (req, res) => {
    const { id: bookId } = req.params;
    const { userId } = req.user;

    try {
        const result = await BookReview.deleteOne({ book: bookId, user: userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Review tidak ditemukan' });
        }

        res.status(200).json({ message: 'Review berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menghapus review', error: error.message });
    }
};

const addOrUpdateReadlist = async (req, res) => {
    const { id: bookId } = req.params;
    const { userId } = req.user;
    const { status } = req.body;
    try {
        await UserReadlist.updateOne(
            { book: bookId, user: userId },
            { status },
            { upsert: true }
        );
        res.status(200).json({ message: 'Berhasil ditambahkan ke readlist' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat menambah readlist', error: error.message });
    }
}

const removeReadlist = async (req, res) => {
    const { id: bookId } = req.params;
    const { userId } = req.user;
    try {
        const result = await UserReadlist.deleteOne({ book: bookId, user: userId });
        res.status(200).json({ message: 'Berhasil dihapus dari readlist' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan saat menambah readlist', error: error.message });
    }
}


module.exports = {
    index,
    getReadlist,
    show,
    store,
    update,
    destroy,
    addOrUpdateReview,
    removeReview,
    addOrUpdateReadlist,
    removeReadlist
};
