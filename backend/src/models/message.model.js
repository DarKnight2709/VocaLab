const mongoose = require("mongoose");
const toJSON = require("./plugins/toJSON.plugin");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group"
    },
    content: {
      type: String,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },
    attachments: {
      type: String
    },
    seenBy: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
messageSchema.plugin(toJSON);

const Message = mongoose.model("Message", messageSchema);

module.exports =  Message;
