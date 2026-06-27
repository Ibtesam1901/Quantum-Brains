const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products — List all products
router.get("/", async (req, res) => {
  try {
    const { category, inStock, search } = req.query;
    const filter = {};

    if (category && category !== "all") filter.category = category;
    if (inStock !== undefined) filter.inStock = inStock === "true";
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { nameHindi: new RegExp(search, "i") },
      ];
    }

    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products — Add new product
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/products/:id — Update product
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/products/:id — Delete product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/products/:id/stock — Toggle stock status
router.put("/:id/stock", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });
    product.inStock = !product.inStock;
    await product.save();
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
