const express = require('express');
// const { body } = require('express-validator/check');

const noteController = require('../controllers/note');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// GET /note/posts
router.get('/get', isAuth,  noteController.getNotes);

// POST /note/post
router.post(
  '/create', isAuth, noteController.createNote
);

router.get('/fetch/:noteId', isAuth,  noteController.getNote);

router.put(
  '/update/:noteId', isAuth,
  noteController.updateNote
);

router.delete('/delete/:noteId', isAuth, noteController.deleteNote);

module.exports = router;
