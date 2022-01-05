const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    image: {
      type: Array,
    },
    likes: {
      type: Array,
      default: [],
    },
    postName: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);
