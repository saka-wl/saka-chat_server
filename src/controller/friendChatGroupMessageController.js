const express = require('express');
const { returnFormat, isObjAllow } = require('../utils/format');
const { getChatGroupMessageByChatRoomId, getChatGroupAllNewMessages } = require('../service/chatGroupMessageService');
const router = express.Router();

router.post('/super/getGroupChatMessage', async (req, res) => {
    if(!req.body.chatRoomId) {
        res.send(returnFormat(400, null, '参数错误！'));
        return;
    }
    const resp = await getChatGroupMessageByChatRoomId(req.body.chatRoomId);
    res.send(resp);
})

router.get('/super/getChatGroupNewMessage', async (req, res) => {
    if(!req.query.userId) {
        res.send(returnFormat(200, null, '未携带userId'));
        return;
    }
    const resp = await getChatGroupAllNewMessages(req.query.userId);
    res.send(resp);
})

module.exports = router