const User   = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt    = require("jsonwebtoken")

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email and password are required" })
        }
        const existing = await User.findOne({ email: email })
        if (existing) {
            return res.status(400).json({ error: "Email already registered" })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const user = await User.create({ name: name, email: email, password: hashedPassword })
        const token = jwt.sign(
            { id: user._id, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )
        res.status(201).json({
            message: "Account created successfully",
            token: token,
            user: { id: user._id, name: user.name, email: user.email }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" })
        }
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" })
        }
        const token = jwt.sign(
            { id: user._id, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )
        res.json({
            message: "Login successful",
            token: token,
            user: { id: user._id, name: user.name, email: user.email }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password")
        res.json(user)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { register, login, getMe }
