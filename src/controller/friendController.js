const express = require('express')
const { sendFriendRequst, getAllRequestToMe, getAllRequestFromMe } = require('../service/friendshipService')
const { returnFormat } = require('../utils/format')
const router = express.Router()

router.post("/super/sendFriendRequst", (req, res, next) => {
    const fromUserId = req.body.fromUserId
    const toUserId = req.body.toUserId
    const requestMessage = req.body.requestMessage
    if(!fromUserId || !toUserId) {
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
    const resp = await getAllRequestToMe(req.query.toUserId)
    return returnFormat(200, resp, '')
})

router.get("/super/getAllRequestFromMe", async (req, res, next) => {
    if(!req.query.fromUserId) {
        res.send(returnFormat(400, undefined, '无登录状态！'))
    }
    const resp = await getAllRequestFromMe(req.query.fromUserId)
    res.send(returnFormat(200, resp, ''))
})

module.exports = router