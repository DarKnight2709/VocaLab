const mongoose = require("mongoose");
const toJSON = require("./plugins/toJSON.plugin");

const blacklistedTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Tự động xóa khi hết hạn
    },
  },
  { timestamps: true }
);

// add plugin that converts mongoose to json
blacklistedTokenSchema.plugin(toJSON);

const BlacklistedToken = mongoose.model("BlacklistedToken", blacklistedTokenSchema);

module.exports = BlacklistedToken;

