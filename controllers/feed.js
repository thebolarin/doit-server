
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const dotenv = require('dotenv')
const schedule = require('node-schedule');
const Task = require('../models/feed');
const User = require('../models/user');
const moment = require('moment');
const messagebird = require('messagebird')(process.env.MESSAGE_KEY);
dotenv.config();
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'odutusinmoses@gmail.com',
//     pass: 'lilbola19'
//   }
// });

exports.getIndex = async (req, res, next) => {

  try {

    const userDetail = await User.find({ 'id': req.userId });
    const allWork = await Task.countDocuments({ category: 'Work', completed: false, 'creator': req.userId });
    const allPersonal = await Task.countDocuments({ category: 'Personal', completed: false, 'creator': req.userId });
    const allFood = await Task.countDocuments({ category: 'Food', completed: false, 'creator': req.userId });
    const allGeneral = await Task.countDocuments({ category: 'General', completed: false, 'creator': req.userId });
    res.status(200).json({
      work: allWork,
      personal: allPersonal,
      food: allFood,
      general: allGeneral,
      userDetail: userDetail
    });
  }

  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

};
// find($or: [{ 'trashed': false},{ 'completed': false }])
exports.getTasks = (req, res, next) => {
  Task.find({ 'completed': false, 'creator': req.userId })
    .sort({ createdAt: -1 })

    .then(tasks => {
      res.status(200).json({
        message: 'Fetched tasks successfully.',
        tasks: tasks,

      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getCompletedTasks = (req, res, next) => {

  Task.find({ 'completed': true, 'creator': req.userId }).sort({ createdAt: -1 })
    .then(tasks => {
      res.status(200).json({
        message: 'Fetched tasks successfully.',
        tasks: tasks,

      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getTrashedTasks = (req, res, next) => {

  Task.find({ 'trashed': true, 'creator': req.userId }).sort({ createdAt: -1 })
    .then(tasks => {
      res.status(200).json({
        message: 'Fetched tasks successfully.',
        tasks: tasks,

      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createTask = (req, res, next) => {

  const title = req.body.title;
  const date = req.body.date;
  const time = req.body.time;
  const completed = req.body.completed;
  const trashed = req.body.trashed;
  const category = req.body.category;
  const tag = req.body.tag;
  const remind = req.body.remind;
  let creator;
  creater = req.name;
  dateD = moment.parseZone(date).format('Y-MM-DD'),
    timeT = moment.parseZone("12:15 AM").format('hh:mm')
  console.log(date);
  console.log(time);
  console.log(dateD);
  var defaultDT = moment.parseZone(dateD + " " + time);
  console.log(defaultDT);
  const task = new Task({
    title: title,
    date: date,
    time: time,
    completed: completed,
    trashed: trashed,
    category: category,
    tag: tag,
    remind: remind,
    creator: req.userId
  });

  task
    .save()
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.tasks.push(task);
      return user.save();
    })

    .then(result => {
      messagebird.lookup.read(req.phone, '+234', function (err, response) {
        console.log(req.name);


        var reminderDT = defaultDT.clone().subtract(2, 'hours');
        console.log(reminderDT);
        messagebird.messages.create({
          originator: "doit",
          recipients: [response.phoneNumber],
          scheduledDatetime: reminderDT.format(),
          body: req.name + ", here's a reminder that you have a task titled " + title + " scheduled for " + defaultDT.format('HH:mm A') + ". Continue to accomplish milestones!!!"
        }, function (err, response) {
          if (err) {
            console.log(err);
            res.send("Error occured while sending message!");
          } else {
            console.log(response);
            console.log('Message sent sucessfully')
          }
        });

      });
      // let mailOptions = {
      //   from: 'Doit',
      //   to: 'odutusinmoses@gmail.com',
      //   subject: "moses's tasks for dec26 ",
      //   html: ' <h3 style="color:blue;padding-bottom:10px;font-size:30px;">doit<h3/><br/><p>Hi moses ,<br/> <br/><br/>your task for dec 26th will be due for completion by tomorrow</p>'
      // }
      // transporter.sendMail(mailOptions)
      //   .then(function (response) {
      //     console.log('Email sent!!');
      //   }).catch(function (error) {
      //     console.log('Error:', error);
      //   });
      res.status(201).json({
        message: 'Task created successfully!',
        task: task,
        creator: { _id: creator._id, name: creator.name }
      })
    })
    .then(result => console.log('Task stored successfully!!'))
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};





exports.updateTask = (req, res, next) => {
  const taskId = req.params.taskId;

  const completed = true;

  Task.findById(taskId)
    .then(task => {

      task.completed = completed;

      return task.save();
    })
    .then(result => {
      res.status(200).json({ message: 'task updated!' });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.trashed = (req, res, next) => {
  const taskId = req.params.taskId;

  const trashed = true;

  Task.findById(taskId)
    .then(task => {

      task.trashed = trashed;

      return task.save();
    })
    .then(result => {
      res.status(200).json({ message: 'task updated!' });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.restore = (req, res, next) => {
  const taskId = req.params.taskId;

  const restore = false;

  Task.findById(taskId)
    .then(task => {

      task.trashed = restore;

      return task.save();
    })
    .then(result => {
      res.status(200).json({ message: 'task updated!' });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteTask = (req, res, next) => {
  const taskId = req.params.taskId;
  Task.findById(taskId)
    .then(task => {
      if (!task) {
        const error = new Error('Could not find task.');
        error.statusCode = 404;
        throw error;
      }
      if (task.creator.toString() !== req.userId) {
        const error = new Error('Not authorized!');
        error.statusCode = 403;
        throw error;
      }

      return Task.findByIdAndRemove(taskId);
    })
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      user.tasks.pull(taskId);
      return user.save();
    })

    .then(result => {
      res.status(200).json({ message: 'Deleted task.' });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
