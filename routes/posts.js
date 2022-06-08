const express = require('express');
const router = require('express').Router();
const Post = require('../models/post');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const app = express();

var admin = require('firebase-admin');

var serviceAccount = require('../react-native-push-notifi-fabfe-firebase-adminsdk-dakss-2d15e8befb.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// const token =
//   'dUB8KI0RSjuHTZdCcpV9kn:APA91bFi4AelCnYT6rXU7BcrWDOhpa8BYg3-2vHez9ZtOChp1sV2C6ej3GV69JwfB3pc-gBiOMLxY2VsepjRET07VSlhEYtNstpLQ-yw3ryRsrOH-uafdOp4MiFduYwguw257cpICul8';
// 'cm0ZUNwoTb-PC52N4PFZyc:APA91bE5MjM0SWeF8VytgpYI4GsQPMM8xZEj2ZRGrECBzN_JSUvQLspqRthwPT3rJGN3fJC5qF51vt3Eli3-Rx4uGV6DhHbH-1xeZOLA03lF96MMFICZ8zEEWorf7CBxZ-uiWpt0Suy1';
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
router.post('/createpost', async (req, res) => {
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
router.put('/updatePost/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // console.log(65, post);
    // console.log(66, req);
    // console.log(66, req.body.userId);
    // console.log(66, req.body.description);
    if (post.userId == req.body.userId) {
      await post.updateOne({ $set: req.body });
      res
        .status(200)
        .json({ success: true, data: 'The post has been updated!' });
    } else {
      res
        .status(500)
        .json({ success: false, data: 'You can update only your post!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, data: err });
  }
});

// delete a post
router.delete('/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    // await post.deleteOne()

    // const post = await Post.findById(req.params.id);
    // if (post.userId == req.body.userId) {
    //   await post.deleteOne();
    res.status(200).json({ success: true, data: 'The post has been deleted!' });
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
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const sendMsgUser = await User.findById({ _id: post.userId });
    const user = await User.findById({ _id: req.body.userId });
    // let token = req.params.token;
    const message = {
      token: sendMsgUser.deviceId,
      notification: {
        body: post.description,
        title: `${user.username} like your post`,
        // data: JSON.stringify(post),
        // color: '#fff566',
        // priority: 'high',
        // sound: 'default',
        // vibrateTimingsMillis: [200, 500, 800],
        imageUrl: `https://res.cloudinary.com/dd6tdswt5/image/upload/v1644503344/${post.image}`,
        // subTitle: post.postName,
      },
      data: {
        customData: JSON.stringify(post),
        id: '1',
        ad: 'Saimoon',
        subTitle: post.postName,
      },
      android: {
        notification: {
          imageUrl: `https://res.cloudinary.com/dd6tdswt5/image/upload/v1644503344/${post.image}`,
          color: '#fff566',
          priority: 'high',
          sound: 'default',
          vibrateTimingsMillis: [200, 500, 800],
          // subTitle: post.postName,
        },
      },
      apns: {
        payload: {
          aps: {
            'mutable-content': 1,
          },
        },
        fcm_options: {
          image: `https://res.cloudinary.com/dd6tdswt5/image/upload/v1644503344/${post.image}`,
        },
      },
    };
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      admin
        .messaging()
        .send(message)
        .then((msg) => {
          console.log(msg);
        });
      res.status(200).json({ success: true, data: 'The post has been liked!' });
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res
        .status(200)
        .json({ success: true, data: 'The post has been disliked!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, data: err });
  }
});

// get a post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, data: err });
  }
});

// get all posts i.e timeline posts
router.get('/timeline/:userId', async (req, res) => {
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
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id });
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, data: err });
  }
});
// get all posts
router.get('/post/AllPost', async (req, res) => {
  try {
    const posts = await Post.find();
    // console.log(161, posts);
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    // console.log(164, err);
    res.status(500).json({ success: false, data: err });
  }
});

// hide post from user

router.put('/:id/hide', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.hidePost.includes(req.body.userId)) {
      await post.updateOne({ $push: { hidePost: req.body.userId } });
      res.status(200).json({ success: true, data: 'The post has been hide!' });
    } else {
      await post.updateOne({ $pull: { hidePost: req.body.userId } });
      res
        .status(200)
        .json({ success: true, data: 'The post has been unhide!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, data: err });
  }
});

module.exports = router;

// android: {
//   notification: {
//     body: post.description,
//     title: `${user.username} like your post`,
//     color: '#fff566',
//     priority: 'high',
//     sound: 'default',
//     vibrateTimingsMillis: [200, 500, 800],
//     imageUrl: `https://res.cloudinary.com/dd6tdswt5/image/upload/v1644503344/${post.image}`,
//   },
// },
