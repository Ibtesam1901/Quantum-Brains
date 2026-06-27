const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'kirana.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        
        // Initialize tables
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_phone TEXT NOT NULL,
            order_text TEXT,
            items TEXT,
            total_amount REAL DEFAULT 0,
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, () => {
            // Attempt to add total_amount column if it doesn't exist (for existing DBs)
            db.run(`ALTER TABLE orders ADD COLUMN total_amount REAL DEFAULT 0`, (err) => {
                // Ignore error if column already exists
            });
        });
        
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL
        )`, () => {
            // Seed products if empty
            db.get(`SELECT COUNT(*) as count FROM products`, (err, row) => {
                if (row && row.count === 0) {
                    const stmt = db.prepare(`INSERT INTO products (name, price) VALUES (?, ?)`);
                    stmt.run('rice', 60);
                    stmt.run('milk', 30);
                    stmt.run('sugar', 45);
                    stmt.run('dal', 120);
                    stmt.run('tea', 250);
                    stmt.finalize();
                    console.log('Seeded products table.');
                }
            });
        });
    }
});

module.exports = db;
