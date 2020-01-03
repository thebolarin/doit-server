const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv')
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const morgan = require('morgan');
const cors = require('cors');
const helmet= require('helmet');
const feedRoutes = require('./routes/feed');
const noteRoutes = require('./routes/note');
const authRoutes = require('./routes/auth');
const compression = require('compression');

dotenv.config();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname,'access.log'),
  {flags:'a'}
);

const app = express();
app.use (helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined' , {stream:accessLogStream}));
// const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_URI = 'mongodb+srv://bolarinwa:JAlbZjlfi6P18f62@cluster0-25yze.mongodb.net/doit?retryWrites=true&w=majority'

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);
app.use('/note', noteRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});
const port = process.env.PORT || 3000;

mongoose
.connect(MONGODB_URI ,{ useNewUrlParser: true })

  .then(result => {
    app.listen(port, () => console.log(`Server started on port ${port}`));
  })
  .catch(err => {
    console.log(err);
  });