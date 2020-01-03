const fs = require('fs');
const path = require('path');

const Note = require('../models/note');
const User = require('../models/user');

exports.getNotes = (req, res, next) => {

    Note.find({ 'creator': req.userId }).sort({ createdAt: -1 })
        .then(notes => {
            res.status(200).json({
                message: 'Fetched notes successfully.',
                notes: notes,

            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};




exports.createNote = (req, res, next) => {

    const title = req.body.title;
    const content = req.body.content;
    let creator;
    const note = new Note({
        title: title,
        content: content,
        creator: req.userId
    });
    note
        .save()
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            creator = user;
            user.notes.push(note);
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'note created successfully!',
                note: note,
                creator: { _id: creator._id, name: creator.name }
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getNote = (req, res, next) => {
    const noteId = req.params.noteId;
    Note.findById(noteId)
        .then(note => {
            if (!note) {
                const error = new Error('Could not find note.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'note fetched.', note: note });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.updateNote = (req, res, next) => {
    const noteId = req.params.noteId;

    const title = req.body.title;
    const content = req.body.content;


    Note.findById(noteId)
        .then(note => {
            if (!note) {
                const error = new Error('Could not find note.');
                error.statusCode = 404;
                throw error;
            }

            note.title = title;
            note.content = content;
            return note.save();
        })
        .then(result => {
            res.status(200).json({ message: 'note updated!', note: result });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.deleteNote = (req, res, next) => {
    const noteId = req.params.noteId;
    Note.findById(noteId)
        .then(note => {
            if (!note) {
                const error = new Error('Could not find note.');
                error.statusCode = 404;
                throw error;
            }
            if (note.creator.toString() !== req.userId) {
                const error = new Error('Not authorized!');
                error.statusCode = 403;
                throw error;
            }

            return Note.findByIdAndRemove(noteId);
        })
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            user.notes.pull(noteId);
            return user.save();
        })

        .then(result => {
            res.status(200).json({ message: 'Deleted note.' });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

