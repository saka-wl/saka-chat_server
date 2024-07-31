
const { v4: uuidv4 } = require('uuid');
const mainMessage = require("../index")

exports.getJSessionIdInCode = (code) => {
    const jsessionId = uuidv4()
    mainMessage.globalSessionInfo.set(jsessionId, { code })
    return jsessionId
}

/**
 * 验证图形验证码
 * @param {*} jsessionId 
 * @param {*} code 
 * @returns 
 */
exports.verify = (jsessionId, code) => {
    if(!jsessionId || !mainMessage.globalSessionInfo.has(jsessionId)) return false;
    const captcha = mainMessage.globalSessionInfo.get(jsessionId)
    mainMessage.globalSessionInfo.del(jsessionId)
    if(captcha.code?.toLowerCase() !== code?.toLowerCase()) return false;
    return true;
}