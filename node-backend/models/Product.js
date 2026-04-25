

const mongoose = require("mongoose")

const ProductSchema = new mongoose.Schema({
    productCode:  { type: String, required: true, unique: true },
    product:      { type: String, required: true },  // "Laptop" or "Mobile Phone"
    brand:        { type: String, required: true },
    price:        { type: Number, required: true },
    ram:          { type: String },
    rom:          { type: String },
    region:       { type: String },
    quantitySold: { type: Number, default: 0 },
    month:        { type: Number }
}, {
    timestamps: true
})

module.exports = mongoose.model("Product", ProductSchema)