
const chatMessageModel = require("../model/chatMessageModel")

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
    await chatMessageModel.create(savedObj)
}