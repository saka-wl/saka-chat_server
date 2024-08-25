
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

    if(usersMap.has(~~userId)) {
        usersMap.del(~~userId)
    }
    console.log(userId + ' ' + Date.now())
    // usersMap.set(~~userId, {
    //     sendMessage: (name, msg) => {
    //         socket.emit(name, msg)
    //     }
    // })
    usersMap.set(~~userId, socket.id);
}