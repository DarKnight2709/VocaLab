const mongoose = require("mongoose");
const toJSON = require("./plugins/toJSON.plugin");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      private: true, // password should not be returned in JSON
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    avatar: {
      type: String,
      required: false,
    }
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

const User = mongoose.model("User", userSchema);

module.exports =  User;
