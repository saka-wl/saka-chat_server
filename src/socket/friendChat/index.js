
const { saveMessage } = require("../../service/friendChatService");
const { objFormat } = require("../../utils/format");
const { verifyJWT } = require("../../utils/jwt")

/**
 * 向好友发送消息
 * @param {*} data 
 * @returns 
 */
exports.sendMsgToFriend = async (usersMap, data) => {
    const userId = data.userId
    const friendId = data.friendId
    const res = verifyJWT(data.token)
    if(res === false || userId != res.id || !friendId) {
        return;
    }
    const friendSocket = usersMap.get(~~friendId)
    // 1. 更新数据库消息，不需要异步await等待
    const resp = await saveMessage(data)
    // 2. 如果用户在线，在线发送消息
    if(!friendSocket || typeof friendSocket?.sendMessage !== 'function') {
        return;
    }
    friendSocket.sendMessage(objFormat(resp.dataValues, 1, 'updatedAt', 'deletedAt'));
}