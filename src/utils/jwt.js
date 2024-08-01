
const jwt = require('jsonwebtoken')

exports.encipherJWT = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES })
}

exports.verifyJWT = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return false
    }
}