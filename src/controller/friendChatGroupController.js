const express = require('express');
const { returnFormat } = require('../utils/format');
const { createChatRoomGroup, getChatRoomGroupListByCondition, sendGroupChatRequest, getChatRoomGroupRequestListByCondition } = require('../service/friendChatGroupService');
const router = express.Router()

router.post('/super/getAllFriendChatGroupByCondition', async (req, res) => {
    const data = req.body;
    if(!data) {
        res.send(returnFormat(400, null, '传递参数错误！'));
        return
    }
    const resp = await getChatRoomGroupListByCondition(data);
    res.send(resp);
})

router.post('/super/createNewChatGroup', async (req, res) => {
    const data = req.body;
    if(!data) {
        res.send(returnFormat(400, null, '传递参数错误！'));
        return;
    }
    const {
        chatRoomName,
        makerUserId,
        avatar,
        humanIds,
        humanNumber
    } = data;
    if(!chatRoomName || !makerUserId || !humanIds || !humanNumber) res.send(returnFormat(400, null, '传递参数错误！'));
    if(~~humanNumber < 3) {
        res.send(returnFormat(400, null, '人数不足，无法创建群聊！'));
        return;
    }
    const resp = await createChatRoomGroup({ chatRoomName, makerUserId, avatar, humanIds, humanNumber });
    res.send(resp);
})

router.post('/super/sendGroupChatRequest', async (req, res) => {
    const data = req.body;
    if(!data) {
        res.send(returnFormat(400, null, '传递参数错误！'));
        return;
    }
    const resp = await sendGroupChatRequest(data);
    res.send(resp);
})

router.post('/super/getAllChatGroupRequestByCondition', async (req, res) => {
    const data = req.body;
    if(!data) {
        res.send(returnFormat(400, null, '传递参数错误！'));
        return
    }
    const resp = await getChatRoomGroupRequestListByCondition(data);
    res.send(resp);
})

module.exports = router;