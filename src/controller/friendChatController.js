const express = require('express')
const { getChatMessage, getNewChatMessageList, changeNewMsgStatus } = require('../service/friendChatService')
const { returnFormat, objFormat } = require('../utils/format')
const router = express.Router()

router.post('/super/getFriendHistoryMsg', async (req, res) => {
    let obj = {
        chatRoomId: req.body.chatRoomId,
        // status: req.body.status || 1
    }
    const tmp = await getChatMessage(obj);
    // 消息类型
    const targetStatus = req.body.status || ['0', '1', '2'];
    const result = [];
    tmp.forEach((it) => {
        if(targetStatus.includes(it.status))
            result.push(objFormat(it, 1, 'updatedAt', 'deletedAt'));
    })
    res.send(returnFormat(200, result, ''));
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