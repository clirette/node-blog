const router = require("express").Router();
const passport = require("passport");
const Post = require("../models/Post");
const User = require("../models/User");

// Helper method to strip sensitive data from either array of posts
// or single post.
const cleanPosts = posts => {
  if (Array.isArray(posts)) {
    return posts.map(post => {
      post.createdBy.email = undefined;
      post.createdBy.password = undefined;
      return post;
    });
  } else {
    posts.createdBy.email = undefined;
    posts.createdBy.password = undefined;
    return posts;
  }
};

router.get(
  "/my-posts",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const currentUser = await User.findById(req.user._id).populate("posts");
    return res.send(currentUser.posts);
  }
);

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const posts = await Post.find({ createdBy: req.user.id })
      .populate("createdBy")
      .catch(err => {
        console.log(err);
        return res.status(401).send(err);
      });
    const cleanedPosts = cleanPosts(posts);
    return res.status(200).json(cleanedPosts);
  }
);

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { title, content } = req.body;
    const newPost = new Post({
      title,
      content,
      createdAt: new Date(),
      createdBy: req.user.id
    });
    await newPost.save().catch(err => {
      console.log(err);
      return res.status(400).send(err);
    });
    req.user.posts.push(newPost);
    await req.user.save();
    return res.status(200).send(newPost);
  }
);

router.get("/all", async (req, res) => {
  const allPosts = await Post.find({})
    .populate("createdBy")
    .catch(err => {
      console.log(err);
      return res.status(400).send(err);
    });
  const cleanedPosts = cleanPosts(allPosts);
  return res.json(cleanedPosts);
});

router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("createdBy")
    .catch(err => {
      console.log(err);
      return res.status(400).send(err);
    });
  if (!post) {
    return res.status(404).json({ msg: "Post not found" });
  }
  const cleanPost = cleanPosts(post);
  return res.status(200).json(cleanPost);
});

router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const post = await Post.findById(req.params.id).catch(err => {
      console.log(err);
      return res.status(400).send(err);
    });
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (!post.createdBy.equals(req.user.id)) {
      return res
        .status(401)
        .json({ msg: "Not allowed to edit another user's post" });
    }
    const { title, content } = req.body;
    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }
    await post.save().catch(err => {
      console.log(err);
      return res.status(400).send(err);
    });
    return res.status(200).json(post);
  }
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const post = await Post.findById(req.params.id).catch(err => {
      console.log(err);
      return res.status(400).send(err);
    });
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    if (!post.createdBy.equals(req.user.id)) {
      return res
        .status(401)
        .json({ msg: "Not allowed to delete another user's post" });
    }
    await post.remove();
    return res.status(200).json({ msg: "Post deleted", postId: req.params.id });
  }
);

module.exports = router;
