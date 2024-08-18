
const { DataTypes } = require('sequelize')
const sequelize = require('../db/db')

module.exports = sequelize.define("ChatMessage", {
    chatRoomId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fromUserId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    toUserId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    messageInfo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // string | file | pic
    messageType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // 1 正常显示； 0 过时消息； -1 已删除消息；-2 撤回消息
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 1
    }
}, {
    freezeTableName: true,
    createdAt: true,
    updatedAt: true,
    paranoid: true,     // 此次以后，该表的数据不会真正的被删除，而是加上一行 deleteAt
})