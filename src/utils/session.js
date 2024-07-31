
const { v4: uuidv4 } = require('uuid');

let globalSessionInfo = new Map()

exports.getJSessionIdInCode = (code) => {
    const jsessionId = uuidv4()
    globalSessionInfo.set(jsessionId, { code, date: Date.now() })
    console.log(globalSessionInfo)
    return jsessionId
}

/**
 * 验证图形验证码
 * @param {*} jsessionId 
 * @param {*} code 
 * @returns 
 */
exports.verify = (jsessionId, code) => {
    console.log(globalSessionInfo)
    if(!jsessionId || !globalSessionInfo.has(jsessionId)) return false;
    const captcha = globalSessionInfo.get(jsessionId)
    globalSessionInfo.delete(jsessionId)
    console.log(captcha)
    if(captcha.code?.toLowerCase() !== code?.toLowerCase()) return false;
    if(~~captcha.date + ~~process.env.CAPTCHA_TIMELINE < Date.now()) return false;
    return true;
}

/**
 * 定时清除内存
 */
exports.clearSessionMap = (time) => {
    setInterval(() => {
        let keys = globalSessionInfo.keys()
        for(let key of keys) {
            if(~~globalSessionInfo[key]?.date + ~~process.env.CAPTCHA_TIMELINE < Date.now()) {
                globalSessionInfo.delete(key)
            }
        }
    }, time)
}