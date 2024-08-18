const express = require('express')
const { getChatMessage } = require('../service/friendChatService')
const { returnFormat } = require('../utils/format')
const router = express.Router()

router.post('/super/getFriendHistoryMsg', async (req, res) => {
    let obj = {
        chatRoomId: req.body.chatRoomId,
        status: req.body.status || 1
    }
    const resp = await getChatMessage(obj)
    res.send(returnFormat(200, resp, ''))
})

module.exports = router