const express = require("express");
const router = express.Router();
const { handleIncomingMessage } = require("../whatsapp/chatbot");

// POST /api/webhook/whatsapp — Twilio webhook endpoint
router.post("/whatsapp", async (req, res) => {
  try {
    const { From, Body } = req.body;

    if (!From || !Body) {
      return res.status(400).json({ error: "Missing From or Body" });
    }

    console.log(`[Webhook] Incoming from ${From}: ${Body}`);

    // Process message asynchronously
    handleIncomingMessage(From, Body).catch((err) => {
      console.error("[Webhook] Async processing error:", err);
    });

    // Respond immediately to Twilio (they expect fast response)
    res.set("Content-Type", "text/xml");
    res.status(200).send("<Response></Response>");
  } catch (error) {
    console.error("[Webhook] Error:", error);
    res.status(500).send("<Response></Response>");
  }
});

// GET /api/webhook/whatsapp — Health check for webhook
router.get("/whatsapp", (req, res) => {
  res.json({ status: "ok", message: "WhatsApp webhook is active" });
});

module.exports = router;
