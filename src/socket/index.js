
const { Server } = require("socket.io");

const { sendMsgToFriend, userFriendWithDrawMsg } = require("./friendChat/index");
const loginServer = require("./login/userLogin");
const logoutServer = require("./login/userLogout");
const { sendMsgToChatGroupRoom } = require("./groupRoomChat");

// const usersMap = new NodeCache({ })
const usersMap = new Map();

exports.isUserOnline = (userId) => {
    if (usersMap.has(~~userId)) {
        return true;
    }
    return false;
}

exports.socketApp = function (server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.SOCKET_CORS_URL
        }
    });
    io.on("connection", async (socket) => {
        /**
         * 监听用户发送的信息
         * 再将信息存储到数据库
         * 如果用户在线，在线发送消息
         */
        socket.on("sendMsgToFriend", (data) => sendMsgToFriend(socket, usersMap, data));

        /**
         * 发送群聊消息
         */
        socket.on('sendMsgToChatGroupRoom', (data) => sendMsgToChatGroupRoom(socket, usersMap, data));

        /**
         * 聊天后端登录验证
         * 更新后端userMap中用户在线信息
         */
        socket.on("userLogin", (data) => loginServer(socket, usersMap, data));

        /**
         * 用户主动退出登录
         */
        socket.on("userLogout", (data) => logoutServer(socket, usersMap, data));

        /**
         * 用户撤回消息
         */
        socket.on('userFriendWithDrawMsg', (data) => userFriendWithDrawMsg(socket, usersMap, data));

        /**
         * 用户直接退出
         */
        socket.on('disconnect', () => logoutServer(socket, usersMap));
    });
}