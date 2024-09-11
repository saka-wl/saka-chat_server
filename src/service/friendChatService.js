
const { Op, where } = require("sequelize")
const chatMessageModel = require("../model/chatMessageModel")
const userModel = require("../model/userModel")
const { objFormat } = require("../utils/format")

/**
 * 保存消息至数据库
 * @param {*} data 
 */
exports.saveMessage = async (data) => {
    let savedObj = {
        chatRoomId: data.chatRoomId,
        fromUserId: data.userId,
        toUserId: data.friendId,
        messageInfo: data.message,
        messageType: data?.messageType || 'string',
        status: data?.status || 2
    }
    return await chatMessageModel.create(savedObj)
}

/**
 * 根据条件获取消息
 * @param {*} obj 
 * @returns 
 */
exports.getChatMessage = async (obj) => {
    const resp = await chatMessageModel.findAll({ where: obj, order: [['createdAt', 'ASC']] })
    resp.forEach((it, index) => {
        resp[index] = objFormat(it.dataValues, 1, 'updatedAt', 'deletedAt')
    })
    return resp
}

/**
 * 获取新消息
 * @param {*} userId 
 * @returns 
 */
exports.getNewChatMessageList = async (userId, chatRoomId) => {
    // 新消息
    let newChatMsg = await chatMessageModel.findAll(
        { 
            where: { 
                [Op.or]: 
                [ 
                    {
                        toUserId: userId,
                        status: 2,
                    }, 
                    { 
                        chatRoomId: chatRoomId.toString(),
                        toUserId: userId,
                    },
                ]}, 
            order: [['createdAt', 'ASC']] }
    );
    newChatMsg = newChatMsg.map(it => it.dataValues);
    let newChatMsgRes = {};
    for(let item of newChatMsg) {
        if(item.chatRoomId == chatRoomId) {
            newChatMsgRes[item.fromUserId] = 0;
            continue;
        }
        newChatMsgRes[item.fromUserId] = (newChatMsgRes[item.fromUserId] || 0) + 1;
    }
    // 旧消息, 5 天前
    let historyChatMsg = await chatMessageModel.findAll({
        where: {
            toUserId: userId,
            createdAt: {
                [Op.gt]: new Date(new Date() - 5 * 24 * 60 * 60 * 1000)
            }
        }
    });
    let historyChatMsgRes = [];
    for(let item of historyChatMsg) {
        if(historyChatMsgRes.includes(item.dataValues.fromUserId)) continue;
        historyChatMsgRes.push(item.dataValues.fromUserId);
    }

    return {
        newChatMsgRes,
        historyChatMsgRes
    }
}

exports.changeNewMsgStatus = async (chatRoomId, toUserId, status = 1) => {
    await chatMessageModel.update({ status }, { where: { chatRoomId, toUserId, status: '2' } });
}

exports.changeMsgStatus = async (id, obj) => {
    if(!id) return;
    obj = objFormat(obj, 0, 'status', 'messageInfo');
    await chatMessageModel.update(obj, { where: { id } });
}