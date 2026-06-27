const Product = require("../models/Product");

/**
 * Parse free-form text into structured order items.
 * Handles formats like:
 *   "2 atta, 1kg sugar, 500g dal"
 *   "2x rice, 3 milk, 1 packet biscuit"
 *   "atta 2, sugar 1kg"
 */

const QUANTITY_PATTERNS = [
  /^(\d+(?:\.\d+)?)\s*x\s+(.+)$/i,           // "2x Atta"
  /^(\d+(?:\.\d+)?)\s*(?:kg|kgs)\s+(.+)$/i,   // "2kg Sugar"
  /^(\d+(?:\.\d+)?)\s*(?:g|gm|gms)\s+(.+)$/i, // "500g Dal"
  /^(\d+(?:\.\d+)?)\s*(?:l|ltr|litre)\s+(.+)$/i, // "1l Milk"
  /^(\d+(?:\.\d+)?)\s*(?:ml)\s+(.+)$/i,       // "500ml Oil"
  /^(\d+(?:\.\d+)?)\s*(?:pcs?|pieces?)\s+(.+)$/i, // "2pcs Soap"
  /^(\d+(?:\.\d+)?)\s+(.+)$/i,                // "2 Atta"
  /^(.+?)\s+(\d+(?:\.\d+)?)\s*(?:kg|kgs|g|gm|l|ltr|ml|pcs?|pieces?|x)?$/i, // "Atta 2kg"
];

const fuzzyMatch = (input, products) => {
  const inputLower = input.toLowerCase().trim();

  // Exact match first
  const exact = products.find(
    (p) =>
      p.name.toLowerCase() === inputLower ||
      (p.nameHindi && p.nameHindi.toLowerCase() === inputLower)
  );
  if (exact) return exact;

  // Partial match
  const partial = products.find(
    (p) =>
      p.name.toLowerCase().includes(inputLower) ||
      inputLower.includes(p.name.toLowerCase()) ||
      (p.nameHindi &&
        (p.nameHindi.toLowerCase().includes(inputLower) ||
          inputLower.includes(p.nameHindi.toLowerCase())))
  );
  if (partial) return partial;

  // Word-level match
  const inputWords = inputLower.split(/\s+/);
  let bestMatch = null;
  let bestScore = 0;

  for (const product of products) {
    const productWords = product.name.toLowerCase().split(/\s+/);
    let score = 0;
    for (const iw of inputWords) {
      for (const pw of productWords) {
        if (pw.includes(iw) || iw.includes(pw)) {
          score += 1;
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = product;
    }
  }

  return bestScore > 0 ? bestMatch : null;
};

const parseOrderText = async (text) => {
  const products = await Product.find({ inStock: true });
  if (!products.length) {
    return { success: false, error: "No products available", items: [] };
  }

  // Split by comma, newline, or "and"
  const parts = text
    .split(/[,\n]|\band\b/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const items = [];
  const notFound = [];

  for (const part of parts) {
    let quantity = 1;
    let productName = part;
    let unit = null;
    let matched = false;

    // Try each quantity pattern
    for (const pattern of QUANTITY_PATTERNS) {
      const match = part.match(pattern);
      if (match) {
        // Check if it is reversed pattern (name first, then qty)
        if (pattern === QUANTITY_PATTERNS[QUANTITY_PATTERNS.length - 1]) {
          productName = match[1].trim();
          quantity = parseFloat(match[2]);
        } else {
          quantity = parseFloat(match[1]);
          productName = match[2].trim();
        }

        // Detect unit from the pattern
        if (/kg/i.test(part)) unit = "kg";
        else if (/\bg\b|gm/i.test(part)) {
          unit = "g";
          // Convert grams to kg if product is sold by kg
          if (quantity >= 100) {
            quantity = quantity / 1000;
            unit = "kg";
          }
        } else if (/ml/i.test(part)) {
          unit = "ml";
          if (quantity >= 100) {
            quantity = quantity / 1000;
            unit = "litre";
          }
        } else if (/l\b|ltr|litre/i.test(part)) unit = "litre";

        matched = true;
        break;
      }
    }

    // Fuzzy match product
    const product = fuzzyMatch(productName, products);
    if (product) {
      const itemUnit = unit || product.unit;
      const subtotal = Math.round(product.price * quantity * 100) / 100;
      items.push({
        productId: product._id,
        name: product.name,
        quantity,
        unit: itemUnit,
        price: product.price,
        subtotal,
      });
    } else {
      notFound.push(productName);
    }
  }

  return {
    success: items.length > 0,
    items,
    notFound,
    total: items.reduce((sum, item) => sum + item.subtotal, 0),
  };
};

module.exports = { parseOrderText, fuzzyMatch };
