const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');

describe('Post and User insert', () => {

  it('Inserts a user and post', done => {
    const user = new User({
      firstName: 'Chase',
      lastName: 'Lirette'
    });
    user.save()
      .then(() => {
        User.findOne({ firstName: 'Chase' })
          .then(found => {
            const post = new Post({
              title: 'New Title',
              content: 'This is the content',
              createdAt: new Date(),
              createdBy: found._id
            });
            post.save()
              .then(() => {
                Post.findOne({ title: 'New Title' })
                  .populate('createdBy')
                  .then(foundPost => {
                    console.log(foundPost);
                    done();
                  })
              })
          })
      })
  });
})