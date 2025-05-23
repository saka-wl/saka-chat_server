
const { verifyJWT } = require("../../utils/jwt")
const userFriendModel = require('../../model/userFriendModel')
const { Op } = require("sequelize")
const userModel = require("../../model/userModel")

/**
 * 将返回信息的回调存储到map中
 * @param {*} socket 
 * @param {*} data 
 * @returns 
 */
module.exports = async (socket, usersMap, data) => {
    const userId = data.userId;
    if (!userId) {
        return;
    }

    if(usersMap.has(~~userId)) {
        socket.to(usersMap.get(~~userId)).emit('userForceLogout');
        usersMap.delete(~~userId);
    }
    usersMap.set(~~userId, socket.id);
    // 更新数据库在线状态
    await userModel.update({ isOnline: true, socketId: socket.id }, { where: { id: ~~userId } });
    // 寻找他的好友，查看是否在线，在线就通知好友其上线了
    const allFriends = await userFriendModel.findAll({ where: { [Op.or]: [{ userId: userId + '' }, { friendId: userId + '' }] } });
    for(let item of allFriends) {
        let tmpId = '';
        if(item.friendId != userId) {
            tmpId = item.friendId;
        }
        if(item.userId != userId) {
            tmpId = item.userId;
        }
        if(usersMap.has(~~tmpId)) {
            socket.to(usersMap.get(~~tmpId)).emit('friendOnlineChange', userId, true);
        }
    }
}