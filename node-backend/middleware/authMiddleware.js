// middleware/authMiddleware.js
const jwt = require("jsonwebtoken")

const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({ error: "Not logged in" })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" })
    }
}

module.exports = { protect }