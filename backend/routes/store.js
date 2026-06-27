const express = require("express");
const router = express.Router();
const Store = require("../models/Store");

// GET /api/store — Get store settings
router.get("/", async (req, res) => {
  try {
    let store = await Store.findOne();
    if (!store) {
      store = await Store.create({ name: "My Kirana Store" });
    }
    res.json({ success: true, data: store });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/store — Update store settings
router.put("/", async (req, res) => {
  try {
    let store = await Store.findOne();
    if (!store) {
      store = await Store.create(req.body);
    } else {
      Object.assign(store, req.body);
      await store.save();
    }
    res.json({ success: true, data: store });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
