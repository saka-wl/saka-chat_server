const express = require('express')
const { returnFormat, deleteObjNullKeys } = require('../utils/format')
const { enroll, login, autoLogin, changeUserInfo } = require('../admin-service/adminUserService')
const { getUserInfoByCondition, changeUserStatus } = require('../service/userService')
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
    const avatar = req.body?.avatar
    const levelPwd = req.body?.levelPwd
    const notAllow = [null, undefined, ""]
    if(notAllow.includes(account?.trim()) || notAllow.includes(password?.trim())) {
        res.send(returnFormat(400, undefined, "账号、密码、昵称不能为空！"));
        return
    }
    res.send(await enroll(account, password, nickname, phone, avatar, levelPwd));
})

// 自动登录
router.get('/adminsuper/whoami', async (req, res, next) => {
    const userInfo = req.userInfo
    res.send(await autoLogin(userInfo.account, userInfo.id));
})

/**
 * 获取用户侧用户信息
 */
router.post('/adminsuper/getUserInfoByCondition', async (req, res) => {
    const resp = await getUserInfoByCondition(req.body.condition, req.body.page);
    res.send(returnFormat(200, { list: resp.rows, total: resp.count }, ''));
})

router.get('/adminsuper/changeUserStatus', async (req, res) => {
    await changeUserStatus(req.query.userId, req.query.status);
    res.send(returnFormat(200, true, '修改成功'));
})

router.get('/loginout', async (req, res) => {
    res.send(returnFormat(200, true, '退出成功'));
})

module.exports = router