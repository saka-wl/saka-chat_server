const express = require('express')
const { verify } = require('../utils/session')
const { returnFormat, deleteObjNullKeys } = require('../utils/format')
const { enroll, login, autoLogin, searchUser, changeUserInfo } = require('../service/userService')
const { setCookie } = require('../utils/cookie')
const router = express.Router()

router.post('/login', async (req, res, next) => {
    // 1. 验证图形验证码
    const isCaptchaCorrect = verify(req?.cookies[process.env.CAPTCHA_SESSION_NAME], req.body?.code)
    if(!isCaptchaCorrect) {
        res.send(returnFormat(410, undefined, "验证码错误或者过期！"))
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
    const [data, shortToken, longToken] = await login(account, password);
    if(shortToken && longToken) {
        res.cookie(process.env.JWT_SHORT_TOKEN_NAME, shortToken);
        res.cookie(process.env.JWT_TOKEN_NAME, longToken);
    }
    res.send(data);
})

router.post('/enroll', async (req, res, next) => {
    const account = req.body.account
    const password = req.body.password
    const nickname = req.body.nickname
    const phone = req.body?.phone
    const email = req.body?.email
    const avatar = req.body?.avatar
    const notAllow = [null, undefined, ""]
    if(notAllow.includes(account?.trim()) || notAllow.includes(password?.trim())) {
        res.send(returnFormat(400, undefined, "账号、密码、昵称不能为空！"));
        return
    }
    // 1. 验证图形验证码
    const isCaptchaCorrect = verify(req?.cookies[process.env.CAPTCHA_SESSION_NAME], req.body?.code)
    if(!isCaptchaCorrect) {
        res.send(returnFormat(410, undefined, "验证码错误！"))
        return
    }
    // 2. 注册
    const [data, shortToken, longToken] = await enroll(account, password, nickname, phone, email, avatar);
    res.cookie(process.env.JWT_SHORT_TOKEN_NAME, shortToken);
    res.cookie(process.env.JWT_TOKEN_NAME, longToken);
    res.send(data);
})

// 自动登录
router.get('/super/whoami', async (req, res, next) => {
    const userInfo = req.userInfo
    res.send(await autoLogin(userInfo.account, userInfo.id));
})

router.put('/', (req, res, next) => {

})

router.post('/super/searchUser', async (req, res, next) => {
    const resp = await searchUser({
        account: req.body.account,
        nickname: req.body.nickname,
        friendId: req.body.id,
        userId: req.body.userId
    })
    res.send(returnFormat(200, resp, "查询成功！"))
})

router.post('/super/changeUserInfo', async (req, res) => {
    const resp = await changeUserInfo(deleteObjNullKeys(req.body));
    res.send(resp);
})

module.exports = router