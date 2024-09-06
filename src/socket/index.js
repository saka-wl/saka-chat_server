
const { Server } = require("socket.io");

const { sendMsgToFriend } = require("./friendChat/index");
const loginServer = require("./login/userLogin");
const logoutServer = require("./login/userLogout");
const userModel = require("../model/userModel");

// const usersMap = new NodeCache({ })
const usersMap = new Map();

async function init() {
    const resp = await userModel.findAll({ where: { isOnline: true } });
    for(let item of resp) {
        const tmp = item.dataValues;
        usersMap.set(tmp.id, tmp.socketId);
    }
}

init();

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
        socket.on("sendMsgToFriend", (data) => sendMsgToFriend(socket, usersMap, data));
    
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
         * 用户直接退出
         */
        socket.on('disconnect', () => logoutServer(socket, usersMap));
    });
}