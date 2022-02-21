const router = require("express").Router();
const bcrypt = require("bcrypt");
// import User model
const User = require("../models/user");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    // generates a random text salt for use with hashpw
    // 1st few chars in this hold bcrypt version number and value for log_rounds
    // remainder chars stores 16 bytes of base64 encoded randomness for seeding the hashing algorithm
    // bcrypt.hash(data, salt, "callback(optional)")

    // generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // create new user
    const newUser = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      profilePicture: req.body.profilePicture,
      coverPicture: req.body.coverPicture,
      followers: req.body.followers,
      phoneNumber: req.body.phoneNumber,
      country: req.body.country,
      following: req.body.following,
      isAdmin: req.body.isAdmin,
      city: req?.body?.city,
    });

    // save user and return response
    const user = await newUser.save();
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, data: err });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, data: "user not found!" });
    }
    // !user && res.status(404).json("user not found!");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json({ success: false, data: "wrong password!" });
    }
    // !validPassword && res.status(400).json("wrong password!")

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, data: err });
  }
});

module.exports = router;
