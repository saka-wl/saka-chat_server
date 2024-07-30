const express = require('express')
const { verify } = require('../utils/session')
const router = express.Router()

router.post('/login', (req, res, next) => {
    // 1. 验证图形验证码
    const isCaptchaCorrect = verify(req?.cookies[process.env.CAPTCHA_SESSION_NAME], req.body.code)
    if(!isCaptchaCorrect) {
        res.send(400, undefined, "验证码错误！")
        return
    }

})

router.post('/enroll', (req, res, next) => {

})

router.get('/whoami', (req, res, next) => {

})

router.put('/', (req, res, next) => {

})