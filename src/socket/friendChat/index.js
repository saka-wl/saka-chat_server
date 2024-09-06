
const userModel = require("../../model/userModel");
const { saveMessage } = require("../../service/friendChatService");
const { objFormat } = require("../../utils/format");
const { verifyJWT } = require("../../utils/jwt")

/**
 * 向好友发送消息
 * @param {*} data 
 * @returns 
 */
exports.sendMsgToFriend = async (socket, usersMap, data) => {
    const userId = data.userId
    const friendId = data.friendId
    data.status = 2;
    const res = verifyJWT(data.token);
    if(res === false || userId != res.id || !friendId) {
        return;
    }
    const friendSocketId = usersMap.get(~~friendId) || usersMap.get(friendId.toString());
    const userSocketId = usersMap.get(~~userId) || usersMap.get(userId.toString());
    // 1. 更新数据库消息
    const resp = await saveMessage(data);
    if(userSocketId) {
        socket.emit('getMsgFromMine', objFormat(resp.dataValues, 1, 'updatedAt', 'deletedAt'));
    }else{
        // 用户状态失活处理
        usersMap.set(~~userId, data.mySocketId);
        await userModel.update({ isOnline: true, socketId: socket.id }, { where: { id: ~~userId } });
        socket.to(data.mySocketId).emit('getMsgFromMine', objFormat(resp.dataValues, 1, 'updatedAt', 'deletedAt'));
    }
    // 2. 如果用户在线，在线发送消息
    if(!friendSocketId) {
        return;
    }
    socket.to(friendSocketId).emit('getMsgFromFriend', objFormat(resp.dataValues, 1, 'updatedAt', 'deletedAt'));
}