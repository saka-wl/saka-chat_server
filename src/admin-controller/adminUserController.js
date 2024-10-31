const express = require('express')
const { returnFormat, deleteObjNullKeys } = require('../utils/format')
const { enroll, login, autoLogin, changeUserInfo } = require('../admin-service/adminUserService')
const router = express.Router()

router.post('/login', async (req, res, next) => {
    const account = req.body.account
    const password = req.body.password
    const notAllow = [null, undefined, ""]
    if(notAllow.includes(account?.trim()) || notAllow.includes(password?.trim())) {
        res.send(returnFormat(400, undefined, "账号或密码不能为空！"));
        return
    }
    res.send(await login(account, password));
})

router.post('/enroll', async (req, res, next) => {
    const account = req.body.account
    const password = req.body.password
    const nickname = req.body.nickname
    const phone = req.body?.phone
    const email = req.body?.email
    const avatar = req.body?.avatar
    const levelPwd = req.body?.levelPwd
    const notAllow = [null, undefined, ""]
    if(notAllow.includes(account?.trim()) || notAllow.includes(password?.trim())) {
        res.send(returnFormat(400, undefined, "账号、密码、昵称不能为空！"));
        return
    }
    res.send(await enroll(account, password, nickname, phone, email, avatar, levelPwd));
})

// 自动登录
router.get('/super/whoami', async (req, res, next) => {
    const userInfo = req.userInfo
    res.send(await autoLogin(userInfo.account, userInfo.id))
})

router.post('/super/changeUserInfo', async (req, res) => {
    const resp = await changeUserInfo(deleteObjNullKeys(req.body));
    res.send(resp);
})

module.exports = router