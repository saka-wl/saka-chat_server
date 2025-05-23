
/**
 * 生成cookie格式
 * @param {*} key 
 * @param {*} value 
 * @returns 
 */
exports.setCookie = (key, value, time = null) => {
    // return `${key}=${value}; domain=${process.env.SERVER_HOST}; path=/; httpOnly=true; max-age=${Math.floor(process.env.CAPTCHA_TIMELINE / 1000)}`
    return `${key}=${value}; path=/; max-age=${time || process.env.CAPTCHA_TIMELINE}; secure=true; samesite=none;`
}