// controllers/mlController.js
// Contains all logic for calling the Python ML service

const axios = require("axios")

const PYTHON_API = process.env.PYTHON_API || "http://localhost:5000"

// POST /ml/predict
const predictDemand = async (req, res) => {
    try {
        const { price } = req.body

        if (!price) {
            return res.status(400).json({ error: "Send a 'price' field" })
        }

        const response = await axios.post(`${PYTHON_API}/predict`, {
            price: Number(price)
        })

        res.json(response.data)

    } catch (error) {
        res.status(500).json({
            error:   "ML service error",
            details: error.message
        })
    }
}

// POST /ml/predict/batch
const predictBatch = async (req, res) => {
    try {
        const { prices } = req.body

        if (!prices || !Array.isArray(prices)) {
            return res.status(400).json({ error: "Send a 'prices' array" })
        }

        const response = await axios.post(`${PYTHON_API}/predict/batch`, {
            prices: prices
        })

        res.json(response.data)

    } catch (error) {
        res.status(500).json({
            error:   "ML service error",
            details: error.message
        })
    }
}

// POST /ml/recommend/user
const recommendForUser = async (req, res) => {
    try {
        const { customer_name } = req.body

        if (!customer_name) {
            return res.status(400).json({
                error: "Send a 'customer_name' field"
            })
        }

        const response = await axios.post(`${PYTHON_API}/recommend/user`, {
            customer_name: customer_name
        })

        res.json(response.data)

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json(error.response.data)
        }
        res.status(500).json({
            error:   "ML service error",
            details: error.message
        })
    }
}

// POST /ml/recommend/product
const recommendSimilarProducts = async (req, res) => {
    try {
        const { product_code } = req.body

        if (!product_code) {
            return res.status(400).json({
                error: "Send a 'product_code' field"
            })
        }

        const response = await axios.post(
            `${PYTHON_API}/recommend/product`,
            { product_code: product_code }
        )

        res.json(response.data)

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json(error.response.data)
        }
        res.status(500).json({
            error:   "ML service error",
            details: error.message
        })
    }
}

// GET /ml/model/info
const getModelInfo = async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API}/model/info`)
        res.json(response.data)
    } catch (error) {
        res.status(500).json({
            error:   "ML service error",
            details: error.message
        })
    }
}

module.exports = {
    predictDemand,
    predictBatch,
    recommendForUser,
    recommendSimilarProducts,
    getModelInfo
}