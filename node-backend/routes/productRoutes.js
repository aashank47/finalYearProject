// routes/productRoutes.js
// Routes only define URLs — all logic is in the controller

const express   = require("express")
const router    = express.Router()
const {
    getAllProducts,
    getProductByCode,
    getLaptops,
    getPhones,
    getByBrand
} = require("../controllers/productController")

router.get("/",                    getAllProducts)
router.get("/filter/laptops",      getLaptops)
router.get("/filter/phones",       getPhones)
router.get("/filter/brand/:brand", getByBrand)
router.get("/:productCode",        getProductByCode)

module.exports = router