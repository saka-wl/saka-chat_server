const express = require('express')
const { verify } = require('../utils/session')
const { returnFormat } = require('../utils/format')
const router = express.Router()

router.post('/login', (req, res, next) => {
    // 1. 验证图形验证码
    const isCaptchaCorrect = verify(req?.cookies[process.env.CAPTCHA_SESSION_NAME], req.body.code)
    if(!isCaptchaCorrect) {
        res.send(returnFormat(400, undefined, "验证码错误！"))
        return
    }
    const account = req.body.account
    const password = req.body.password
    const notAllow = [null, undefined, ""]
    if(notAllow.includes(account?.trim()) || notAllow.includes(password?.trim())) {
        res.send(returnFormat(400, undefined, "账号或密码不能为空！"));
        return
    }
    // 2. 查询数据库验证账号密码
    res.send(returnFormat(200, "aaa", 'sss'))
})

router.post('/enroll', (req, res, next) => {

})

router.get('/whoami', (req, res, next) => {

})

router.put('/', (req, res, next) => {

})

module.exports = router