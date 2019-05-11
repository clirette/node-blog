const mongoose = require('mongoose');

before(done => {
  mongoose.connect('mongodb://localhost:27017/blog', {useNewUrlParser: true})
    .then(() => { done(); })
    .catch(err => console.log(err));
});

beforeEach(done => {
  const { users, posts } = mongoose.connection.collections;
  posts.drop(() => {
    users.drop(() => {
      done();
    });
  });
});