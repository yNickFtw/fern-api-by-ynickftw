const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: String,
    email: String,
    password: String,
    profileImage: String,
    bio: String,
    followers: Array,
    following: Array,
    likesUser: Array,
    savesUser: Array,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema)

module.exports = User