
const chatMessageModel = require("../model/chatMessageModel")
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
        messageType: data?.messageType || 'string'
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