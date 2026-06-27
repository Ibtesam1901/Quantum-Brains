const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "My Kirana Store",
    },
    ownerName: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    whatsappNumber: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    settings: {
      welcomeMessage: {
        type: String,
        default:
          "🙏 Namaste! Welcome to {storeName}!\n\nHow can I help you today?\n\n1️⃣ Place Order\n2️⃣ View Menu\n3️⃣ Track Order\n4️⃣ Cancel Order\n5️⃣ Help\n\nReply with a number or type your request!",
      },
      orderConfirmMessage: {
        type: String,
        default:
          "✅ Your order #{orderId} has been placed!\nTotal: ₹{total}\n\nWe'll notify you when it's ready. Thank you! 🙏",
      },
      autoReply: {
        type: Boolean,
        default: true,
      },
      operatingHours: {
        open: { type: String, default: "08:00" },
        close: { type: String, default: "22:00" },
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Store", storeSchema);
