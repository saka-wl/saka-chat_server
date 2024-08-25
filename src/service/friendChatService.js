
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
        status: data?.status || 1
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
    let obj = {
        toUserId: userId,
        status: 2,
        messageType: 'string'
    };
    const chatMsg = await chatMessageModel.findAll({ where: { [Op.or]: [ obj, { chatRoomId: chatRoomId.toString() } ] }, order: [['createdAt', 'ASC']] });
    const needFrinedInfoId = new Set();
    chatMsg.forEach((it, index) => {
        chatMsg[index] = objFormat(it.dataValues, 1, 'updatedAt', 'deletedAt');
        if (chatMsg[index].fromUserId !== chatMsg[index].toUserId) needFrinedInfoId.add(~~chatMsg[index].fromUserId);
    })
    const friendsInfo = await userModel.findAll({ where: { id: { [Op.or]: Array.from(needFrinedInfoId) } } })
    let resp = {};
    for(let item of chatMsg) {
        if (!resp[item.chatRoomId]) {
            let friendInfo = objFormat(friendsInfo.find(it => it.id == item.fromUserId).dataValues, 1, 'updatedAt', 'deletedAt', 'password', 'id');
            resp[item.chatRoomId] = { ... item, friendAccount: friendInfo.account, friendNickname: friendInfo.nickname, newMsgCount: 0 };
            if(item.status === 2) resp[item.chatRoomId].newMsgCount ++;
            continue;
        }
        let tmp = resp[item.chatRoomId];
        if(tmp.status == 2) {
            tmp.newMsgCount ++;
        }
        if(tmp.createdAt > item.createdAt) {
            continue;
        }
        tmp = { ... tmp, ... item };
        resp[item.chatRoomId] = tmp;
    }
    return resp;
}

exports.changeNewMsgStatus = async (chatRoomId, toUserId) => {
    await chatMessageModel.update({ status: 1 }, { where: { chatRoomId, toUserId } });
}