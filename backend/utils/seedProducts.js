const Product = require("../models/Product");
const Store = require("../models/Store");

const defaultProducts = [
  // Staples
  { name: "Rice (Basmati)", nameHindi: "Chawal", price: 85, unit: "kg", category: "Staples" },
  { name: "Wheat Flour (Atta)", nameHindi: "Atta", price: 45, unit: "kg", category: "Staples" },
  { name: "Toor Dal", nameHindi: "Arhar Dal", price: 140, unit: "kg", category: "Staples" },
  { name: "Moong Dal", nameHindi: "Moong Dal", price: 120, unit: "kg", category: "Staples" },
  { name: "Chana Dal", nameHindi: "Chana Dal", price: 95, unit: "kg", category: "Staples" },
  { name: "Sugar", nameHindi: "Cheeni", price: 45, unit: "kg", category: "Staples" },
  { name: "Salt", nameHindi: "Namak", price: 25, unit: "kg", category: "Staples" },
  { name: "Poha", nameHindi: "Poha", price: 50, unit: "kg", category: "Staples" },

  // Dairy
  { name: "Milk (Full Cream)", nameHindi: "Doodh", price: 60, unit: "litre", category: "Dairy" },
  { name: "Curd", nameHindi: "Dahi", price: 45, unit: "kg", category: "Dairy" },
  { name: "Butter (Amul)", nameHindi: "Makhan", price: 56, unit: "piece", category: "Dairy" },
  { name: "Paneer", nameHindi: "Paneer", price: 80, unit: "piece", category: "Dairy" },

  // Oils & Ghee
  { name: "Mustard Oil", nameHindi: "Sarson Ka Tel", price: 180, unit: "litre", category: "Oils & Ghee" },
  { name: "Sunflower Oil", nameHindi: "Surajmukhi Tel", price: 150, unit: "litre", category: "Oils & Ghee" },
  { name: "Ghee (Desi)", nameHindi: "Ghee", price: 550, unit: "kg", category: "Oils & Ghee" },

  // Spices
  { name: "Turmeric Powder", nameHindi: "Haldi", price: 200, unit: "kg", category: "Spices" },
  { name: "Red Chilli Powder", nameHindi: "Lal Mirch", price: 300, unit: "kg", category: "Spices" },
  { name: "Garam Masala", nameHindi: "Garam Masala", price: 40, unit: "piece", category: "Spices" },
  { name: "Cumin Seeds", nameHindi: "Jeera", price: 260, unit: "kg", category: "Spices" },

  // Snacks
  { name: "Biscuits (Parle-G)", nameHindi: "Biscuit", price: 10, unit: "packet", category: "Snacks" },
  { name: "Chips (Lays)", nameHindi: "Chips", price: 20, unit: "packet", category: "Snacks" },
  { name: "Namkeen (Haldiram)", nameHindi: "Namkeen", price: 40, unit: "packet", category: "Snacks" },

  // Beverages
  { name: "Tea (Tata)", nameHindi: "Chai Patti", price: 220, unit: "kg", category: "Beverages" },
  { name: "Coffee (Nescafe)", nameHindi: "Coffee", price: 120, unit: "piece", category: "Beverages" },

  // Household
  { name: "Detergent (Surf)", nameHindi: "Sabun Powder", price: 110, unit: "kg", category: "Household" },
  { name: "Dish Soap (Vim)", nameHindi: "Bartan Sabun", price: 35, unit: "piece", category: "Household" },
  { name: "Matchbox", nameHindi: "Maachis", price: 5, unit: "piece", category: "Household" },
];

const seedDatabase = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log(`[Seed] ${productCount} products already exist. Skipping seed.`);
      return;
    }

    await Product.insertMany(defaultProducts);
    console.log(`[Seed] ${defaultProducts.length} products seeded successfully!`);

    // Create default store if none exists
    const storeCount = await Store.countDocuments();
    if (storeCount === 0) {
      await Store.create({
        name: "My Kirana Store",
        ownerName: "Store Owner",
      });
      console.log("[Seed] Default store created.");
    }
  } catch (error) {
    console.error("[Seed] Error seeding database:", error.message);
  }
};

module.exports = seedDatabase;
