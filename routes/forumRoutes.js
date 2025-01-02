const express = require('express');
const router = express.Router();
const controller = require('../controllers/forumController');
const auth = require('../middleware/auth');

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', auth, controller.store);
router.put('/:id', auth, controller.update);
router.delete('/:id', auth, controller.destroy);

router.get('/:id/comments', controller.getComment);
router.post('/:id/comments', auth, controller.storeComment);

module.exports = router;
