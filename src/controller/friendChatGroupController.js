const express = require('express');
const { returnFormat } = require('../utils/format');
const { createChatRoomGroup } = require('../service/friendChatGroupService');
const router = express.Router()

router.get('/super/getAllMyFriendChatGroup', (req, res) => {
    
})

router.post('/super/createNewChatGroup', async (req, res) => {
    const data = req.body;
    if(!data) res.send(returnFormat(400, null, '传递参数错误！'));
    const {
        chatRoomName,
        makerUserId,
        avatar,
        humanIds,
        humanNumber
    } = data;
    if(!chatRoomName || !makerUserId || !humanIds || !humanNumber) res.send(returnFormat(400, null, '传递参数错误！'));
    if(humanNumber < 3) res.send(returnFormat(400, null, '人数不足，无法创建群聊！'));
    const resp = await createChatRoomGroup({ chatRoomName, makerUserId, avatar, humanIds, humanNumber });
    res.send(resp);
})

module.exports = router;