
const { Server } = require("socket.io");
const loginServer = require("./login/index")
const { sendMsgToFriend } = require("./friendChat/index");

const usersMap = new Map()

module.exports = function (server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.SOCKET_CORS_URL
        }
    });
    io.on("connection", socket => {
        /**
         * 监听用户发送的信息
         * 再将信息存储到数据库
         * 如果用户在线，在线发送消息
         */
        socket.on("sendMsgToFriend", (data) => sendMsgToFriend(usersMap, data));
    
        /**
         * 聊天后端登录验证
         * 更新后端userMap中用户在线信息
         */
        socket.on("userLogin", (data) => loginServer(socket, usersMap, data))
    });
}