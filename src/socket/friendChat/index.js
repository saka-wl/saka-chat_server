
const { saveMessage } = require("../../service/friendChatService");
const { verifyJWT } = require("../../utils/jwt")

/**
 * 向好友发送消息
 * @param {*} data 
 * @returns 
 */
exports.sendMsgToFriend = (refInfo, data) => {
    const userId = data.userId
    const friendId = data.friendId
    const message = data.message
    const res = verifyJWT(data.token)
    if(res === false || userId != res.id || !friendId) {
        return;
    }
    const friendSocket = refInfo.usersMap.get(friendId)
    // 1. 更新数据库消息，不需要异步await等待
    saveMessage(data)
    // 2. 如果用户在线，在线发送消息
    console.log(refInfo.usersMap)
    if(!friendSocket || typeof friendSocket?.sendMessage !== 'function') {
        return;
    }
    friendSocket.sendMessage(message);
}