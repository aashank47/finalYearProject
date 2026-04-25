// src/services/api.js
// Central place for all API calls.
// Components never call fetch/axios directly — they use these functions.

import axios from "axios"

const NODE_API = "http://localhost:4000"

// ── Demand Prediction ─────────────────────────────────────────────────────────

export const predictDemand = async (price) => {
    const response = await axios.post(`${NODE_API}/ml/predict`, { price })
    return response.data
}

export const predictBatch = async (prices) => {
    const response = await axios.post(`${NODE_API}/ml/predict/batch`, { prices })
    return response.data
}

// ── Recommendations ───────────────────────────────────────────────────────────

export const recommendForUser = async (customerName) => {
    const response = await axios.post(`${NODE_API}/ml/recommend/user`, {
        customer_name: customerName
    })
    return response.data
}

export const recommendSimilarProducts = async (productCode) => {
    const response = await axios.post(`${NODE_API}/ml/recommend/product`, {
        product_code: productCode
    })
    return response.data
}

// ── Products & Customers ──────────────────────────────────────────────────────

export const getAllProducts = async () => {
    const response = await axios.get(`${NODE_API}/products`)
    return response.data
}

export const getLaptops = async () => {
    const response = await axios.get(`${NODE_API}/products/filter/laptops`)
    return response.data
}

export const getPhones = async () => {
    const response = await axios.get(`${NODE_API}/products/filter/phones`)
    return response.data
}

export const getAllCustomers = async () => {
    const response = await axios.get(`${NODE_API}/customers`)
    return response.data
}

export const getModelInfo = async () => {
    const response = await axios.get(`${NODE_API}/ml/model/info`)
    return response.data
}