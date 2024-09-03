
const { saveMessage } = require("../../service/friendChatService");
const { objFormat } = require("../../utils/format");
const { verifyJWT } = require("../../utils/jwt")

/**
 * 向好友发送消息
 * @param {*} data 
 * @returns 
 */
exports.sendMsgToFriend = async (socket, usersMap, data) => {
    console.log(data)
    const userId = data.userId
    const friendId = data.friendId
    data.status = 2;
    const res = verifyJWT(data.token)
    if(res === false || userId != res.id || !friendId) {
        return;
    }
    const friendSocketId = usersMap.get(~~friendId) || usersMap.get(friendId.toString());
    const userSocketId = usersMap.get(~~userId) || usersMap.get(userId.toString());
    // 1. 更新数据库消息，不需要异步await等待
    const resp = await saveMessage(data);
    if(userSocketId) {
        // console.log(friendId, userSocket);
        // userSocket.sendMessage('getMsgFromMine', objFormat(resp.dataValues, 1, 'updatedAt', 'deletedAt'));
        socket.emit('getMsgFromMine', objFormat(resp.dataValues, 1, 'updatedAt', 'deletedAt'));
    }
    // 2. 如果用户在线，在线发送消息
    if(!friendSocketId) {
        return;
    }
    // friendSocket.sendMessage("getMsgFromFriend", objFormat(resp.dataValues, 1, 'updatedAt', 'deletedAt'));
    socket.to(friendSocketId).emit('getMsgFromFriend', objFormat(resp.dataValues, 1, 'updatedAt', 'deletedAt'));
}