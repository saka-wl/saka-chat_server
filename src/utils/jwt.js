
const jwt = require('jsonwebtoken')

/**
 * 用户侧加密
 * @param {*} data 
 * @returns 
 */
exports.encipherJWT = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES })
}

/**
 * 用户侧解密
 * @param {*} token 
 * @returns 
 */
exports.verifyJWT = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return false
    }
}

/**
 * admin端JWT加密
 * @param {*} data 
 * @returns 
 */
exports.encipherAdminJWT = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET_ADMIN, { expiresIn: process.env.JWT_EXPIRES_ADMIN })
}

/**
 * admin端JWT解密
 * @param {*} token 
 * @returns 
 */
exports.verifyAdminJWT = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET_ADMIN)
    } catch (error) {
        return false
    }
}