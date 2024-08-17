const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { verifyJWT } = require("./utils/jwt");

require("dotenv").config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173"
    }
});

let usersMap = new Map();

// server-side
io.on("connection", socket => {
    socket.on("sendMsgToFriend", (data) => {
        const userId = data.userId
        const friendId = data.friendId
        const message = data.message
        const res = verifyJWT(data.token)
        if(res === false || userId != res.id || !friendId) {
            return;
        }
        const friendSocket = usersMap.get(friendId)
        // 1. 更新数据库消息

        // 2. 如果用户在线，在线发送消息
        if(!friendSocket || typeof friendSocket?.sendMessage !== 'function') {
            return;
        }

        friendSocket.sendMessage(message);
    });
    socket.on("userLogin", (data) => {
        const res = verifyJWT(data.token)
        const userId = data.userId
        if(res === false || userId != res.id) {
            return;
        }
        usersMap.set(userId, {
            sendMessage: (msg) => {
                socket.emit("getMsgFromFriend", msg)
            }
        })
    })

});

httpServer.listen(3001);