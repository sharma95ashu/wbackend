const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["Admin", "Member", "Viewer"], // as per your requirement
    },
    description: {
      type: String,
      default: "",
    },
    permissions: {
      type: [String], // e.g. ["create_expense", "view_reports"]
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
