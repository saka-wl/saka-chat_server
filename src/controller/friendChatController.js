const express = require('express')
const { getChatMessage, getNewChatMessageList, changeNewMsgStatus } = require('../service/friendChatService')
const { returnFormat } = require('../utils/format')
const router = express.Router()

router.post('/super/getFriendHistoryMsg', async (req, res) => {
    let obj = {
        chatRoomId: req.body.chatRoomId,
        // status: req.body.status || 1
    }
    const resp = await getChatMessage(obj)
    res.send(returnFormat(200, resp, ''))
})

/**
 * 获取该用户所有的新消息
 */
router.get('/super/getUserAllNewMessageList', async (req, res) => {
    if(!req.userInfo.id) return returnFormat(401, null, '您还未登录');
    const resp = await getNewChatMessageList(req.userInfo.id, req.query.chatRoomId);
    res.send(returnFormat(200, resp, ''));
})

router.get("/super/changeNewMsgStatus", async (req, res) => {
    if(!req.userInfo.id) return returnFormat(401, null, '您还未登录');
    changeNewMsgStatus(req.query.chatRoomId, req.userInfo.id);
    res.send(returnFormat(200, true, ''));
})

module.exports = router