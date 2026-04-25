// controllers/productController.js
// Contains all the logic for product-related operations

const Product = require("../models/Product")

// GET /products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find()
        res.json({
            total:    products.length,
            products: products
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// GET /products/:productCode
const getProductByCode = async (req, res) => {
    try {
        const product = await Product.findOne({
            productCode: req.params.productCode
        })
        if (!product) {
            return res.status(404).json({ error: "Product not found" })
        }
        res.json(product)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// GET /products/filter/laptops
const getLaptops = async (req, res) => {
    try {
        const laptops = await Product.find({ product: "Laptop" })
            .sort({ price: 1 })
        res.json({
            total:    laptops.length,
            products: laptops
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// GET /products/filter/phones
const getPhones = async (req, res) => {
    try {
        const phones = await Product.find({ product: "Mobile Phone" })
            .sort({ price: 1 })
        res.json({
            total:    phones.length,
            products: phones
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// GET /products/filter/brand/:brand
const getByBrand = async (req, res) => {
    try {
        const products = await Product.find({
            brand: req.params.brand
        }).sort({ price: 1 })
        res.json({
            total:    products.length,
            products: products
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getAllProducts,
    getProductByCode,
    getLaptops,
    getPhones,
    getByBrand
}