const express = require('express')
const router = express.Router()
const svgCaptcha = require('svg-captcha')
const { getJSessionIdInCode } = require('../utils/session')
const { setCookie } = require('../utils/cookie')

/**
 * 获取二维码图片
 * @returns 
 */
const getCaptcha = async function () {
    return svgCaptcha.create({
        size: 4, // 随机字符串的大小
        ignoreChars: '0o1iIl', // 过滤掉一些字符，如 0o1i
        noise: 1, // 噪声线数
        color: true, // 字符将具有不同的颜色而不是灰色，如果设置了背景选项，则为 true。
        background: '#cc9966' // SVG 图像的背景颜色
    })
}

router.get('/getCaptcha', async (req, res, next) => {
    const captcha = await getCaptcha()
    const jsessionId = getJSessionIdInCode(captcha.text)
    res.setHeader("Content-Type", "image/svg+xml")
    res.setHeader('Set-Cookie', setCookie(process.env.CAPTCHA_SESSION_NAME, jsessionId));
    res.send(captcha.data)
})

module.exports = router
