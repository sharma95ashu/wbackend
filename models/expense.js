const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    customer: {
      type: String,
      required: true,
    },
    product: {
      type: String,
      required: true,
    },
    packagingType: {
      type: String,
      required: true, // e.g., 10 KG Bag
    },
    packagingQty: {
      type: Number,
      required: true, // total number of packages
    },
    itemsPerPack: {
      type: Number,
      required: true,
    },
    totalUnits: {
      type: Number,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    costPerPack: {
      type: Number,
    },
    costPerUnit: {
      type: Number,
    },
    driver: {
      type: String,
    },
    vehicle: {
      type: String,
    },
    from: {
      type: String,
    },
    to: {
      type: String,
    },
    deliveryType: {
      type: String,
      enum: ["Single", "Multi-Stop"],
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Disputed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
