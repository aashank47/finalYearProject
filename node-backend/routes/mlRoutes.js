// routes/mlRoutes.js

const express = require("express")
const router  = express.Router()
const {
    predictDemand,
    predictBatch,
    recommendForUser,
    recommendSimilarProducts,
    getModelInfo
} = require("../controllers/mlController")

router.post("/predict",            predictDemand)
router.post("/predict/batch",      predictBatch)
router.post("/recommend/user",     recommendForUser)
router.post("/recommend/product",  recommendSimilarProducts)
router.get("/model/info",          getModelInfo)

module.exports = router