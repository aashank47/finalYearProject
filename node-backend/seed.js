// seed.js
const mongoose = require("mongoose")
const fs       = require("fs")
const path     = require("path")
require("dotenv").config()

const Product  = require("./models/Product")
const Customer = require("./models/Customer")

function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, "utf8")
    const lines   = content.trim().split("\n")

    // Clean headers — remove BOM, trim whitespace and carriage returns
    const headers = lines[0]
        .replace(/^\uFEFF/, "")   // remove BOM if present
        .split(",")
        .map(h => h.trim().replace(/\r/g, ""))

    console.log("Headers found:", headers)

    const rows = []
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",")
        const row    = {}
        headers.forEach((header, index) => {
            row[header] = values[index]
                ? values[index].trim().replace(/\r/g, "")
                : ""
        })
        rows.push(row)
    }
    return rows
}

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected")

        await Product.deleteMany({})
        await Customer.deleteMany({})
        console.log("Cleared existing data")

        const csvPath = path.join(
            __dirname, "../python-ml/data/ecommerce.csv"
        )
        const rows = parseCSV(csvPath)
        console.log(`Read ${rows.length} rows`)
        console.log("First row sample:", rows[0])

        // ── Insert Products ───────────────────────────────────────────
        const productMap = {}

        for (const row of rows) {
            // Try both "Product Code" and "ProductCode" just in case
            const code = row["Product Code"] || row["ProductCode"] || ""

            if (!code || productMap[code]) continue

            const month = row["Inward Date"]
                ? new Date(row["Inward Date"]).getMonth() + 1
                : null

            productMap[code] = {
                productCode:  code,
                product:      row["Product"]       || "",
                brand:        row["Brand"]          || "",
                price:        parseFloat(row["Price"]) || 0,
                ram:          row["RAM"]            || "",
                rom:          row["ROM"]            || "",
                region:       row["Region"]         || "",
                quantitySold: parseInt(row["Quantity Sold"]) || 0,
                month:        month
            }
        }

        const productDocs = Object.values(productMap)
        await Product.insertMany(productDocs)
        console.log(`Inserted ${productDocs.length} products`)
        console.log("Sample product code:", productDocs[0]?.productCode)

        // ── Insert Customers ──────────────────────────────────────────
        const customerMap = {}

        for (const row of rows) {
            const name = row["Customer Name"] || ""
            const code = row["Product Code"]  || row["ProductCode"] || ""
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