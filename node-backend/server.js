// server.js
// Main entry point for the Node.js backend
require("dotenv").config()

const express  = require("express")
const mongoose = require("mongoose")
const cors     = require("cors")
const authRoutes = require("./routes/authRoutes")

const productRoutes  = require("./routes/productRoutes")
const customerRoutes = require("./routes/customerRoutes")
const mlRoutes       = require("./routes/mlRoutes")

const app  = express()
const PORT = process.env.PORT || 4000

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors())           // allow React (port 3000) to call this server
app.use(express.json())   // parse incoming JSON bodies


// ── Connect to MongoDB ────────────────────────────────────────────────────────

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB error:", err))

// ── Routes ────────────────────────────────────────────────────────────────────

app.use("/products",  productRoutes)
app.use("/customers", customerRoutes)
app.use("/ml",        mlRoutes)
app.use("/auth", authRoutes)

// ── Health check ──────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
    res.json({
        status: "running",
        routes: {
            "GET  /products":               "all products",
            "GET  /products/:code":         "one product",
            "GET  /products/filter/laptops":"laptops only",
            "GET  /products/filter/phones": "phones only",
            "GET  /customers":              "all customers",
            "GET  /customers/:name":        "one customer",
            "POST /ml/predict":             "demand prediction",
            "POST /ml/predict/batch":       "batch prediction",
            "POST /ml/recommend/user":      "user recommendations",
            "POST /ml/recommend/product":   "similar products",
            "GET  /ml/model/info":          "model details"
        }
    })
})

// ── Start server ──────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`Node server running on port ${PORT}`)
})