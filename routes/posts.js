const express = require("express");
const router = require("express").Router();
const Post = require("../models/post");
const User = require("../models/user");
const multer = require("multer");
const path = require("path");
const app = express();

// app.use("/images", express.static(path.join(__dirname, "public/images")));
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
//     console.log(37, req.body);
//   },
// });

// const upload = multer({ storage: storage });
// create a post
// router.post("/createpost", upload.array("file", 12), async (req, res) => {
//   const newPost = new Post({
//     // image: req?.files?.map((res) => {
//     //   return res?.filename;
//     // }),
//     image: req.body.images,
//     description: req.body.description,
//     userId: req.body.userId,
//     likes: req.body.likes,
//     postName: req.body.postName,
//     profilePicture: req.body.profilePicture,
//   });
//   try {
//     const savedPost = await newPost.save();
//     res.status(200).json({ success: true, data: savedPost });
//   } catch (err) {
//     res.status(500).json({ success: false, data: err });
//   }
// });
router.post("/createpost", async (req, res) => {
  const newPost = new Post({
    // image: req?.files?.map((res) => {
    //   return res?.filename;
    // }),
    image: req.body.image,
    description: req.body.description,
    userId: req.body.userId,
    likes: req.body.likes,
    postName: req.body.postName,
    profilePicture: req.body.profilePicture,
  });
  try {
    const savedPost = await newPost.save();
    res.status(200).json({ success: true, data: savedPost });
  } catch (err) {
    res.status(500).json({ success: false, data: err });
  }
});

// update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res
        .status(200)
        .json({ success: true, data: "The post has been updated!" });
    } else {
      res
        .status(500)
        .json({ success: false, data: "You can update only your post!" });
    }
  } catch (err) {
    res.status(500).json({ success: false, data: err });
  }
});

// delete a post
router.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    // await post.deleteOne()

    // const post = await Post.findById(req.params.id);
    // if (post.userId == req.body.userId) {
    //   await post.deleteOne();
    res.status(200).json({ success: true, data: "The post has been deleted!" });
    // } else {
    //   res
    //     .status(403)
    //     .json({ success: false, data: "You can delete only your post!" });
    // }
  } catch (err) {
    res.status(500).json({ success: false, data: err });
  }
});

// like / dislike a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json({ success: true, data: "The post has been liked!" });
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res
        .status(200)
        .json({ success: true, data: "The post has been disliked!" });
    }
  } catch (err) {
    res.status(500).json({ success: false, data: err });
  }
});

// get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, data: err });
  }
});

// get all posts i.e timeline posts
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res
      .status(200)
      .json({ success: true, data: userPosts.concat(...friendPosts) });
  } catch (err) {
    res.status(500).json({ success: false, data: err });
  }
});

// get user's all posts
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, data: err });
  }
});

module.exports = router;
