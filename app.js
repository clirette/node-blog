const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');

const users = require('./api/users');

const app = express();

app.use(logger('dev'));
app.use(express.urlencoded({extended: true}));

mongoose.connect('mongodb://localhost:27017/blog', {useNewUrlParser: true})
  .then(() => console.log("Mongo Connected"));

app.use(passport.initialize());

require('./config/passport')(passport);

app.use('/api/users', users);

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening on port ${port}`));