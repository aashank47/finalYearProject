// controllers/customerController.js
// Contains all the logic for customer-related operations

const Customer = require("../models/Customer")

// GET /customers
const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find()
        res.json({
            total:     customers.length,
            customers: customers
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// GET /customers/:name
const getCustomerByName = async (req, res) => {
    try {
        const customer = await Customer.findOne({
            customerName: req.params.name
        })
        if (!customer) {
            return res.status(404).json({ error: "Customer not found" })
        }
        res.json(customer)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    getAllCustomers,
    getCustomerByName
}