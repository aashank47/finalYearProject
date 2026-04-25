// seed.js
// Run this ONCE to load your ecommerce CSV into MongoDB.
// After running, you can delete this file.

const mongoose = require("mongoose")
const fs       = require("fs")
const path     = require("path")
require("dotenv").config()

const Product  = require("./models/Product")
const Customer = require("./models/Customer")

// Simple CSV parser — no external library needed
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, "utf8")
    const lines   = content.trim().split("\n")
    const headers = lines[0].split(",").map(h => h.trim())

    const rows = []
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",")
        const row    = {}
        headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim() : ""
        })
        rows.push(row)
    }
    return rows
}

async function seed() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected")

        // Clear existing data
        await Product.deleteMany({})
        await Customer.deleteMany({})
        console.log("Cleared existing data")

        // Read CSV — adjust path to where your file is
        const csvPath = path.join(
            __dirname, "../python-ml/data/ecommerce.csv"
        )
        const rows = parseCSV(csvPath)
        console.log(`Read ${rows.length} rows from CSV`)

        // ── Insert Products ───────────────────────────────────────────────
        const productMap = {}   // track unique product codes

        for (const row of rows) {
            const code = row["Product Code"]
            if (!code || productMap[code]) continue

            // Extract month from Inward Date
            const month = row["Inward Date"]
                ? new Date(row["Inward Date"]).getMonth() + 1
                : null

            productMap[code] = {
                productCode:  code,
                product:      row["Product"]      || "",
                brand:        row["Brand"]         || "",
                price:        parseFloat(row["Price"]) || 0,
                ram:          row["RAM"]           || "",
                rom:          row["ROM"]           || "",
                region:       row["Region"]        || "",
                quantitySold: parseInt(row["Quantity Sold"]) || 0,
                month:        month
            }
        }

        const productDocs = Object.values(productMap)
        await Product.insertMany(productDocs)
        console.log(`Inserted ${productDocs.length} products`)

        // ── Insert Customers ──────────────────────────────────────────────
        const customerMap = {}  // track unique customers + their purchases

        for (const row of rows) {
            const name = row["Customer Name"]
            const code = row["Product Code"]
            if (!name) continue

            if (!customerMap[name]) {
                customerMap[name] = {
                    customerName: name,
                    region:       row["Region"] || "",
                    purchases:    []
                }
            }
            if (code) {
                customerMap[name].purchases.push(code)
            }
        }

        const customerDocs = Object.values(customerMap)
        await Customer.insertMany(customerDocs)
        console.log(`Inserted ${customerDocs.length} customers`)

        console.log("\nDatabase seeded successfully!")
        process.exit(0)

    } catch (error) {
        console.log("Seed error:", error.message)
        process.exit(1)
    }
}

seed()