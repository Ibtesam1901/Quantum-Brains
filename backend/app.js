const express = require("express");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const app = express();

const connectDB = require("./config/db");
const seedDatabase = require("./utils/seedProducts");

// Connect DB
connectDB().then(() => {
  seedDatabase();
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const orderRoutes = require("./routes/orders");
const productRoutes = require("./routes/products");
const customerRoutes = require("./routes/customers");
const webhookRoutes = require("./routes/webhook");
const storeRoutes = require("./routes/store");

app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/store", storeRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "KiranaFlow Backend is Running!",
  });
});

// WhatsApp Webhook Verification
app.get("/api/whatsapp/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("Verification Request:", mode, token);

  if (mode === 'subscribe' && token === 'hassan') {
    console.log("WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }

  console.log("Verification Failed");
  return res.sendStatus(403);
});

// WhatsApp Webhook - Receive Messages
app.post("/api/whatsapp/webhook", async (req, res) => {
  try {
    const body = req.body;

    console.log("[Webhook] Received event from Meta:", JSON.stringify(body, null, 2));

    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message) {
        const from = message.from;
        let text = "";

        if (message.type === "text") {
          text = message.text.body;
        } else if (message.type === "interactive") {
          const interactive = message.interactive;
          if (interactive.type === "button_reply") {
            text = interactive.button_reply.title;
          } else if (interactive.type === "list_reply") {
            text = interactive.list_reply.title;
          }
        }

        if (text) {
          console.log(`[Webhook] Processing message from ${from}: "${text}"`);
          const { handleIncomingMessage } = require("./whatsapp/chatbot");
          await handleIncomingMessage(from, text);
        }
      }

      return res.status(200).send("EVENT_RECEIVED");
    }

    return res.sendStatus(404);
  } catch (error) {
    console.error("[Webhook] Error processing incoming webhook:", error);
    return res.status(200).send("EVENT_RECEIVED");
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Webhook URL: http://localhost:${PORT}/api/whatsapp/webhook`
  );
});