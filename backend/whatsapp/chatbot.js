const { STATES, getSession, updateSession, resetSession } = require("./sessionManager");
const { parseOrderText } = require("./messageParser");
const {
  sendWhatsAppMessage,
  formatOrderSummary,
  formatProductCatalog,
  formatStatusUpdate,
} = require("../utils/twilioClient");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Store = require("../models/Store");

/**
 * Main chatbot handler — processes incoming WhatsApp messages
 * and returns appropriate responses.
 */
const handleIncomingMessage = async (from, body) => {
  const phone = from.replace("whatsapp:", "");
  const session = getSession(phone);
  const text = body.trim();
  const textLower = text.toLowerCase();

  console.log(`[Chatbot] From: ${phone} | State: ${session.state} | Msg: ${text}`);

  try {
    // Get or create customer
    let customer = await Customer.findOne({ phone });
    if (!customer) {
      customer = await Customer.create({ phone, name: `Customer` });
    }

    let response = "";

    // Handle based on current state
    switch (session.state) {
      case STATES.CONFIRMING_ORDER:
        response = await handleConfirmation(phone, textLower, session, customer);
        break;

      case STATES.ADDING_ITEMS:
        response = await handleAddItems(phone, text, session, customer);
        break;

      default:
        response = await handleCommand(phone, textLower, text, session, customer);
        break;
    }

    // Send response via WhatsApp
    await sendWhatsAppMessage(from, response);
    return response;
  } catch (error) {
    console.error("[Chatbot] Error:", error);
    const errorMsg = "😔 Sorry, something went wrong. Please try again or type *5* for help.";
    await sendWhatsAppMessage(from, errorMsg);
    return errorMsg;
  }
};

// Handle menu commands and greetings
const handleCommand = async (phone, textLower, text, session, customer) => {
  // Greetings
  if (/^(hi|hello|hey|namaste|namaskar|hola)\b/i.test(textLower)) {
    resetSession(phone);
    return getWelcomeMessage(customer);
  }

  // Order / 1
  if (textLower === "1" || /^(order|new order|place order)\b/i.test(textLower)) {
    const products = await Product.find({ inStock: true }).sort({ category: 1 });
    if (!products.length) {
      return "😔 Sorry, no products are available right now. Please check back later.";
    }
    updateSession(phone, { state: STATES.ADDING_ITEMS });
    return formatProductCatalog(products) + "\n\n📝 Type the items you want to order:";
  }

  // Menu / Products / 2
  if (textLower === "2" || /^(menu|products|catalog|list|catalogue)\b/i.test(textLower)) {
    const products = await Product.find({ inStock: true }).sort({ category: 1 });
    if (!products.length) {
      return "📦 No products available at the moment.";
    }
    updateSession(phone, { state: STATES.BROWSING_MENU });
    return formatProductCatalog(products);
  }

  // Status / Track / 3
  if (textLower === "3" || /^(status|track|my order|orders)\b/i.test(textLower)) {
    return await getOrderStatus(phone, text);
  }

  // Cancel / 4
  if (textLower === "4" || /^(cancel)\b/i.test(textLower)) {
    return await cancelLastOrder(phone);
  }

  // Help / 5
  if (textLower === "5" || /^(help|commands|options)\b/i.test(textLower)) {
    return getHelpMessage();
  }

  // If user sends text that looks like items, try to parse it
  if (text.length > 2 && /\d/.test(text)) {
    updateSession(phone, { state: STATES.ADDING_ITEMS });
    return await handleAddItems(phone, text, session, customer);
  }

  // Default
  return getWelcomeMessage(customer);
};

// Handle item addition
const handleAddItems = async (phone, text, session, customer) => {
  const textLower = text.toLowerCase();

  // Cancel/back
  if (textLower === "cancel" || textLower === "back" || textLower === "0") {
    resetSession(phone);
    return "❌ Order cancelled. Type *Hi* to start again.";
  }

  const result = await parseOrderText(text);

  if (!result.success) {
    return (
      "😕 I couldn't find those items. Please try again.\n\n" +
      "💡 *Tip:* Type items like:\n" +
      '_"2 Atta, 1kg Sugar, 500g Dal"_\n\n' +
      "Or type *2* to see the menu first."
    );
  }

  let msg = "";

  if (result.notFound.length > 0) {
    msg += `⚠️ Could not find: ${result.notFound.join(", ")}\n\n`;
  }

  // Store pending items in session
  updateSession(phone, {
    state: STATES.CONFIRMING_ORDER,
    pendingItems: result.items,
    pendingTotal: result.total,
  });

  msg += formatOrderSummary(result.items, result.total);
  msg += "\n✅ Reply *Yes* to confirm\n❌ Reply *No* to cancel\n✏️ Or type new items to change";

  return msg;
};

// Handle order confirmation
const handleConfirmation = async (phone, textLower, session, customer) => {
  if (
    textLower === "yes" ||
    textLower === "y" ||
    textLower === "confirm" ||
    textLower === "ok" ||
    textLower === "haa" ||
    textLower === "ha"
  ) {
    // Create the order
    const order = await Order.create({
      customerId: customer._id,
      customerName: customer.name,
      customerPhone: phone,
      items: session.pendingItems,
      totalAmount: session.pendingTotal,
      status: "pending",
      paymentStatus: "unpaid",
      statusHistory: [{ status: "pending", timestamp: new Date() }],
    });

    // Update customer stats
    await Customer.findByIdAndUpdate(customer._id, {
      $inc: { orderCount: 1, totalSpent: session.pendingTotal },
      lastOrderDate: new Date(),
    });

    resetSession(phone);

    return (
      `🎉 *Order Placed Successfully!*\n\n` +
      `📋 Order ID: *#${order.orderId}*\n` +
      `💰 Total: *₹${session.pendingTotal}*\n` +
      `📦 Status: Pending\n\n` +
      `We'll notify you when your order is confirmed.\n` +
      `Track anytime by replying *3*\n\n` +
      `Thank you for ordering! 🙏`
    );
  }

  if (textLower === "no" || textLower === "n" || textLower === "cancel" || textLower === "nahi") {
    resetSession(phone);
    return "❌ Order cancelled. Type *Hi* to start again!";
  }

  // They might be changing items
  updateSession(phone, { state: STATES.ADDING_ITEMS });
  return await handleAddItems(phone, textLower, { ...session, state: STATES.ADDING_ITEMS }, customer);
};

// Get order status
const getOrderStatus = async (phone, text) => {
  // Check if a specific order ID was mentioned
  const orderIdMatch = text.match(/KF-?\d+/i);

  if (orderIdMatch) {
    const order = await Order.findOne({
      orderId: new RegExp(orderIdMatch[0].replace("-", "-?"), "i"),
    });
    if (order) {
      return (
        `📋 *Order #${order.orderId}*\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📦 Status: *${order.status.toUpperCase()}*\n` +
        `💰 Total: ₹${order.totalAmount}\n` +
        `💳 Payment: ${order.paymentStatus}\n` +
        `📅 Placed: ${order.createdAt.toLocaleDateString("en-IN")}\n` +
        `\nItems:\n` +
        order.items.map((i) => `  • ${i.name} × ${i.quantity}`).join("\n")
      );
    }
    return "❌ Order not found. Please check the order ID.";
  }

  // Show recent orders
  const orders = await Order.find({ customerPhone: phone })
    .sort({ createdAt: -1 })
    .limit(5);

  if (!orders.length) {
    return "📦 You have no orders yet. Type *1* to place an order!";
  }

  const statusEmojis = {
    pending: "⏳",
    confirmed: "✅",
    ready: "📦",
    delivered: "🚚",
    cancelled: "❌",
  };

  let msg = "📋 *Your Recent Orders*\n━━━━━━━━━━━━━━━━━━\n\n";
  orders.forEach((o) => {
    msg += `${statusEmojis[o.status] || "📌"} *#${o.orderId}* - ₹${o.totalAmount}\n`;
    msg += `   Status: ${o.status} | ${o.createdAt.toLocaleDateString("en-IN")}\n\n`;
  });

  msg += "Reply with an order ID (e.g., *KF-0001*) for details.";
  return msg;
};

// Cancel last pending order
const cancelLastOrder = async (phone) => {
  const order = await Order.findOne({
    customerPhone: phone,
    status: "pending",
  }).sort({ createdAt: -1 });

  if (!order) {
    return "❌ No pending orders to cancel.";
  }

  order.status = "cancelled";
  order.statusHistory.push({
    status: "cancelled",
    timestamp: new Date(),
    note: "Cancelled by customer",
  });
  await order.save();

  return (
    `❌ *Order #${order.orderId} Cancelled*\n\n` +
    `Your pending order of ₹${order.totalAmount} has been cancelled.\n` +
    `Type *1* to place a new order.`
  );
};

// Welcome message
const getWelcomeMessage = (customer) => {
  const greeting = customer.orderCount > 0 ? `Welcome back` : `Welcome`;
  return (
    `🙏 *${greeting}!*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `How can I help you today?\n\n` +
    `1️⃣  *Order* - Place a new order\n` +
    `2️⃣  *Menu* - View products & prices\n` +
    `3️⃣  *Status* - Track your orders\n` +
    `4️⃣  *Cancel* - Cancel pending order\n` +
    `5️⃣  *Help* - Show all commands\n\n` +
    `Reply with a *number* or *keyword*! 🛒`
  );
};

// Help message
const getHelpMessage = () => {
  return (
    `ℹ️ *KiranaFlow Help*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `Here's what you can do:\n\n` +
    `🛒 *Place an order:*\n` +
    `   Type "1" or "order"\n` +
    `   Then send items like "2 Atta, 1kg Sugar"\n\n` +
    `📋 *View menu:*\n` +
    `   Type "2" or "menu"\n\n` +
    `📦 *Track orders:*\n` +
    `   Type "3" or "status"\n` +
    `   Or "track KF-0001"\n\n` +
    `❌ *Cancel order:*\n` +
    `   Type "4" or "cancel"\n\n` +
    `💡 *Tips:*\n` +
    `   • You can order multiple items at once\n` +
    `   • Use quantities like 2x, 1kg, 500g\n` +
    `   • Type "Hi" anytime to see the main menu`
  );
};

module.exports = { handleIncomingMessage };
