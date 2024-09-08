
const { verifyJWT } = require("../../utils/jwt")
const userModel = require("../../model/userModel");
const userFriendModel = require("../../model/userFriendModel");
const { Op } = require("sequelize");

/**
 * 用户主动退出登录
 * @param {*} socket 
 * @param {*} usersMap 
 * @param {*} data 
 */
module.exports = async (socket, usersMap, data) => {
    let userId = data?.userId;
    for(const [key, value] of usersMap.entries()) {
        if(value == socket.id) {
            userId = key;
            break;
        }
    }
    if(!userId) return;

    if(usersMap.has(~~userId)) {
        usersMap.delete(~~userId);
    }
    // 更新数据库在线状态
    await userModel.update({ isOnline: false, socketId: null }, { where: { id: ~~userId } });
    // 寻找他的好友，查看是否在线，在线就通知好友其下线了
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
            socket.to(usersMap.get(~~tmpId)).emit('friendOnlineChange', userId, false);
        }
    }
}