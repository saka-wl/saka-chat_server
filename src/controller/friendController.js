const express = require('express')
const { sendFriendRequst, getAllRequestToMe, getAllRequestFromMe, handleFriendRequest } = require('../service/friendshipService')
const { returnFormat, isObjAllow } = require('../utils/format')
const { getAllMyFriend } = require('../service/userFriendService')
const router = express.Router()

router.post("/super/sendFriendRequst", (req, res, next) => {
    const fromUserId = req.body.fromUserId
    const toUserId = req.body.toUserId
    const requestMessage = req.body.requestMessage
    if (!fromUserId || !toUserId) {
        res.send(returnFormat(400, undefined, '该用户不存在！'))
        return
    }
    sendFriendRequst({
        fromUserId,
        toUserId,
        requestMessage
    })
    res.send(returnFormat(200, true, ''))
})

router.get("/super/getAllRequestToMe", async (req, res, next) => {
    if (!req.query.toUserId) {
        res.send(returnFormat(400, undefined, '无登录状态！'))
    }
    const resp = await getAllRequestToMe(req.query.toUserId)
    res.send(returnFormat(200, resp, ''))
})

router.get("/super/getAllRequestFromMe", async (req, res, next) => {
    if (!req.query.fromUserId) {
        res.send(returnFormat(400, undefined, '无登录状态！'))
    }
    const resp = await getAllRequestFromMe(req.query.fromUserId)
    res.send(returnFormat(200, resp, ''))
})

router.post("/super/handleFriendRequest", async (req, res, next) => {
    if (!isObjAllow(req.body, 'requestId', 'isDispose', 'userId, friendId')) {
        res.send(returnFormat(400, undefined, '未传必要参数'))
        return
    }
    const { requestId, isDispose, userId, friendId } = req.body
    if (isDispose === 0) {
        res.send(returnFormat(400, undefined, '参数错误'))
        return
    }
    const resp = await handleFriendRequest({ requestId, isDispose, friendId, userId })
    if(resp) {
        res.send(returnFormat(200, true, '你们已经是好友啦！'))
        return
    }
    res.send(returnFormat(400, undefined, '出现未知错误，请刷新重试'))
})

router.post("/super/getAllMyFriend", async (req, res, next) => {
    if (!isObjAllow(req.body, 'userId')) {
        res.send(returnFormat(400, undefined, '未传必要参数'))
        return
    }
    const resp = await getAllMyFriend(req.body.userId)
    if(resp) {
        res.send(returnFormat(200, resp, ''))
        return
    }
    res.send(returnFormat(400, undefined, '出现未知错误，请刷新重试'))
})

module.exports = router