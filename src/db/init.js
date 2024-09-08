const sequelize = require("./db")
const userModel = require("../model/userModel")
require("../model/friendshipModel")
require("../model/friendRequestModel")
require("../model/chatRoomModel")
require("../model/chatRoomGroupModel")
require("../model/chatMessageModel")

async function init() {
    await userModel.update({ isOnline: false, socketId: null }, { where: { isOnline: true } });
    await sequelize.sync({
        alter: true
    })
    console.log("数据库初始化完毕！")
}

init()