const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const secret = require('../config/keys').secret;

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const user = await User.findOne({ email })
    if (user) {
      return res.status(400).send({msg: 'Email already registered' });
    }
    const avatar = gravatar.url(email, {
      s: '200', //size
      r: 'g', //rating
      d: 'mm' //default
    })
    const newUser = new User({ firstName, lastName, avatar, email });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    newUser.password = hash;
    const savedUser = await newUser.save();
    return res.json(savedUser);
  } catch(err) {
    console.log(err);
    return res.status(400).send({err});
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ msg: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ msg: 'Incorrect password' });
    }
    const payload = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.avatar
    }
    const token = await jwt.sign(payload, secret, { expiresIn: '1h' });
    return res.json({
      success: true,
      token: `Bearer ${token}`
    })

  } catch(err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  return res.send(req.user);
})

module.exports = router;