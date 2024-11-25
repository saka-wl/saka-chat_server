const express = require('express');
const { returnFormat, isObjAllow } = require('../utils/format');
const { getChatGroupMessageByChatRoomId } = require('../service/chatGroupMessageService');
const router = express.Router();

router.post('/super/getGroupChatMessage', async (req, res) => {
    if(!req.body.chatRoomId) {
        res.send(returnFormat(400, null, '参数错误！'));
        return;
    }
    const resp = await getChatGroupMessageByChatRoomId(req.body.chatRoomId);
    res.send(resp);
})

module.exports = router