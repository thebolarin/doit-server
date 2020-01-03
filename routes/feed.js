const express = require('express');
// const { body } = require('express-validator/check');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /feed/posts
router.get('/get',isAuth,  feedController.getTasks);
router.get('/getComplete',isAuth,  feedController.getCompletedTasks);
router.get('/getTrashed',isAuth,  feedController.getTrashedTasks);
router.get('/getCount',
isAuth, 
 feedController.getIndex);

// POST /feed/post
router.post(
  '/create',isAuth, feedController.createTask
);

// router.get('/post/:postId', isAuth, feedController.getPost);

router.put(
  '/update/:taskId',  feedController.updateTask
);
router.put(
  '/trash/:taskId',feedController.trashed
);
router.put(
  '/restore/:taskId',  feedController.restore
);
router.delete('/delete/:taskId', isAuth, feedController.deleteTask);

module.exports = router;
