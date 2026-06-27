const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Customer",
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      index: true,
    },
    address: {
      type: String,
      default: "",
    },
    orderCount: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastOrderDate: {
      type: Date,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
  },
  { timestamps: true }
);

customerSchema.index({ phone: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model("Customer", customerSchema);
