const chatGroupMessageModel = require("../../model/chatGroupMessageModel")

/**
 * 群聊发送消息流程
 * 1. 将消息存储到数据库中
 * 2. 通知群聊中的人，消息发送成功
 * 3. 通知自己消息发送成功
 * @param {*} socket 
 * @param {*} usersMap 
 * @param {*} data { fromUserId, chatRoomId, messageInfo, messageType, status, humanIds, toUserIds }
 */
exports.sendMsgToChatGroupRoom = async (socket, usersMap, data) => {
    data.status = 1;
    const humanIds = JSON.parse(data.humanIds);
    const fromUserId = data.fromUserId;
    const toUserIds = humanIds.filter(it => ~~it !== ~~fromUserId);
    const notReadedUserIds = humanIds.filter(it => ~~it !== ~~fromUserId);
    // 1. 
    const resp = await chatGroupMessageModel.create({ ... data, toUserIds: JSON.stringify(toUserIds), notReadedUserIds: JSON.stringify(notReadedUserIds) });
    // 2. 
    for(let item of humanIds) {
        const socketId = usersMap.get(~~item) || usersMap.get(item.toString());
        socketId && socket.to(socketId).emit('getGroupMsgFromChatRoom', { ... resp.dataValues, toUserIds });
    }
    // 3. 
    const userSocketId = usersMap.get(~~data.fromUserId) || usersMap.get(data.fromUserId?.toString());
    if(userSocketId) {
        socket.emit('getGroupMsgFromMine', { ... resp.dataValues, toUserIds });
    }
}