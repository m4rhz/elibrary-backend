const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookController');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');

router.get('/', optionalAuth, controller.index);
router.get('/readlist', auth, controller.getReadlist);
router.get('/:id', optionalAuth, controller.show);
router.post('/', auth, controller.store);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.destroy);
router.put('/:id/review', auth, controller.addOrUpdateReview);
router.delete('/:id/review', auth, controller.removeReview);
router.put('/:id/readlist', auth, controller.addOrUpdateReadlist);
router.delete('/:id/readlist', auth, controller.removeReadlist);

module.exports = router;
