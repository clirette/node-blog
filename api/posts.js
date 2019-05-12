const router = require("express").Router();
const passport = require("passport");
const Post = require("../models/Post");

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const posts = await Post.find({ createdBy: req.user.id }).catch(err => {
      console.log(err);
      return res.status(401).send(err);
    });
    return res.status(200).json(posts);
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
    console.log(newPost);
    await newPost.save().catch(err => {
      console.log(err);
      return res.status(400).send(err);
    });
    return res.status(200).send(newPost);
  }
);

router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id).catch(err => {
    console.log(err);
    return res.status(400).send(err);
  });
  if (!post) {
    return res.status(404).json({ msg: "Post not found" });
  }
  return res.status(200).json(post);
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
    return res.status(200).json({ msg: "Post deleted" });
  }
);

router.get("/all", async (req, res) => {
  const allPosts = await Post.find({}).catch(err => {
    console.log(err);
    return res.status(400).send(err);
  });
  return res.json(allPosts);
});

module.exports = router;
