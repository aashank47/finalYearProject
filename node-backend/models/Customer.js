
const mongoose = require("mongoose")

const CustomerSchema = new mongoose.Schema({
    customerName: { type: String, required: true, unique: true },
    region:       { type: String },
    purchases:    [{ type: String }]  // list of product codes they bought
}, {
    timestamps: true
})

module.exports = mongoose.model("Customer", CustomerSchema)