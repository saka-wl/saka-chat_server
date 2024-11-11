
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
 * 用户侧短token加密
 * @param {*} data 
 * @returns 
 */
exports.encipherShortJWT = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET_SHORT_TOKEN, { expiresIn: process.env.JWT_EXPIRES_SHORT_TOKEN })
}

/**
 * 用户侧短token解密
 * @param {*} token 
 * @returns 
 */
exports.verifyShortJWT = (token) => {
    if(!token) return false;
    try {
        let data = jwt.verify(token, process.env.JWT_SECRET_SHORT_TOKEN);
        if(data.secret !== process.env.JWT_SECRET_SHORT_TOKEN_SECRET) return false;
        return data;
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