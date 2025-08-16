const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: Number,
    email: {
      type: String,
      // required: true,
      index: true,
    },
    password: { type: String },
    otp: { type: Number },

    role: {
      type: String,
      default: "subscriber",
    },

    address: { type: String },
    // wishlist: [{ type: ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
