const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameHindi: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      enum: ["kg", "g", "litre", "ml", "piece", "packet", "dozen", "bundle"],
      default: "piece",
    },
    category: {
      type: String,
      enum: [
        "Staples",
        "Dairy",
        "Oils & Ghee",
        "Spices",
        "Snacks",
        "Beverages",
        "Household",
        "Personal Care",
        "Fruits & Vegetables",
        "Other",
      ],
      default: "Other",
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", nameHindi: "text" });

module.exports = mongoose.model("Product", productSchema);
