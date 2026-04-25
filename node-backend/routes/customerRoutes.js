// routes/customerRoutes.js

const express  = require("express")
const router   = express.Router()
const {
    getAllCustomers,
    getCustomerByName
} = require("../controllers/customerController")

router.get("/",      getAllCustomers)
router.get("/:name", getCustomerByName)

module.exports = router