const sequelize = require("./db")
const userModel = require("../model/userModel")
const { createTargetFiles } = require("../utils/file")
require("../model/friendshipModel")
require("../model/friendRequestModel")
require("../model/chatRoomModel")
require("../model/chatRoomGroupModel")
require("../model/chatMessageModel")
require("../model/userAccessTokenModel")
require("../admin-model/adminUserModel")
require("../model/chatRoomGroupIdToUserIdModel")
require("../model/chatRoomGroupRequestModel")
require("../model/chatGroupMessageModel")
require("../model/mdFileModel");
require("../model/userToMdFileModel");

async function init() {
    await sequelize.sync({
        alter: true
    })
    await userModel.update({ isOnline: false, socketId: null }, { where: { isOnline: true } });
    await createTargetFiles();
    console.log("数据库初始化完毕！")
}

init()