
const { verifyJWT } = require("../../utils/jwt")

/**
 * 将返回信息的回调存储到map中
 * @param {*} socket 
 * @param {*} data 
 * @returns 
 */
module.exports = (socket, usersMap, data) => {
    const res = verifyJWT(data.token)
    const userId = data.userId
    if (res === false || userId != res.id) {
        return;
    }

    usersMap.set(userId, {
        sendMessage: (name, msg) => {
            socket.emit(name, msg)
        }
    })
}