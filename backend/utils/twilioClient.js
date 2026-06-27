const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

let client = null;

const getClient = () => {
  if (!client && accountSid && authToken) {
    client = twilio(accountSid, authToken);
  }
  return client;
};

const sendWhatsAppMessage = async (to, body) => {
  const whatsappToken = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.PHONE_NUMBER_ID;

  if (whatsappToken && phoneNumberId) {
    const cleanTo = to.replace("whatsapp:", "").replace(/\D/g, "");
    console.log(`[WhatsApp Cloud API] Sending message to: ${cleanTo}`);
    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${whatsappToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanTo,
            type: "text",
            text: {
              preview_url: false,
              body: body,
            },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to send WhatsApp message via Cloud API");
      }
      console.log(`[WhatsApp Cloud API] Message sent successfully:`, data.messages?.[0]?.id);
      return data;
    } catch (error) {
      console.error("[WhatsApp Cloud API] Send error:", error.message);
      throw error;
    }
  }

  const twilioClient = getClient();
  if (!twilioClient) {
    console.log("[WhatsApp Mock] To:", to);
    console.log("[WhatsApp Mock] Message:", body);
    return { sid: "mock_" + Date.now(), status: "mock" };
  }

  try {
    const message = await twilioClient.messages.create({
      body: body,
      from: whatsappFrom,
      to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
    });
    console.log(`[WhatsApp] Message sent: ${message.sid}`);
    return message;
  } catch (error) {
    console.error("[WhatsApp] Send error:", error.message);
    throw error;
  }
};

const formatBold = (text) => `*${text}*`;
const formatItalic = (text) => `_${text}_`;

const formatOrderSummary = (items, total) => {
  let msg = "📋 *Order Summary*\n";
  msg += "━━━━━━━━━━━━━━━━━━\n";
  items.forEach((item, i) => {
    msg += `${i + 1}. ${item.name} × ${item.quantity} ${item.unit || ""}\n`;
    msg += `   ₹${item.price} × ${item.quantity} = ₹${item.subtotal}\n`;
  });
  msg += "━━━━━━━━━━━━━━━━━━\n";
  msg += `💰 *Total: ₹${total}*\n`;
  return msg;
};

const formatProductCatalog = (products) => {
  let msg = "🛒 *Our Products*\n";
  msg += "━━━━━━━━━━━━━━━━━━\n\n";

  const categories = {};
  products.forEach((p) => {
    if (!categories[p.category]) categories[p.category] = [];
    categories[p.category].push(p);
  });

  let itemNum = 1;
  for (const [category, items] of Object.entries(categories)) {
    msg += `📦 *${category}*\n`;
    items.forEach((item) => {
      const stockEmoji = item.inStock ? "✅" : "❌";
      msg += `  ${itemNum}. ${item.name} - ₹${item.price}/${item.unit} ${stockEmoji}\n`;
      itemNum++;
    });
    msg += "\n";
  }

  msg += "━━━━━━━━━━━━━━━━━━\n";
  msg += "📝 To order, type items like:\n";
  msg += '_"2 Atta, 1kg Sugar, 500g Dal"_\n';
  return msg;
};

const formatStatusUpdate = (orderId, status) => {
  const statusEmojis = {
    pending: "⏳",
    confirmed: "✅",
    ready: "📦",
    delivered: "🚚",
    cancelled: "❌",
  };

  const statusMessages = {
    pending: "Your order is being reviewed",
    confirmed: "Your order has been confirmed!",
    ready: "Your order is ready for pickup/delivery!",
    delivered: "Your order has been delivered. Thank you! 🙏",
    cancelled: "Your order has been cancelled",
  };

  return `${statusEmojis[status] || "📌"} *Order ${orderId} Update*\n\n${statusMessages[status] || status}\n\nReply *3* to track your orders.`;
};

module.exports = {
  getClient,
  sendWhatsAppMessage,
  formatBold,
  formatItalic,
  formatOrderSummary,
  formatProductCatalog,
  formatStatusUpdate,
};
