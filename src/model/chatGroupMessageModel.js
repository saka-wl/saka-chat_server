
const { DataTypes } = require('sequelize')
const sequelize = require('../db/db')

module.exports = sequelize.define("ChatGrouptMessage", {
    chatRoomId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fromUserId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    messageInfo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    toUserIds: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '[]'
    },
    // string | file | pic | video
    messageType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    //  1 正常消息； -1 已删除消息； -2 撤回消息
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 1
    },
    notReadedUserIds: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '[]'
    }
}, {
    freezeTableName: true,
    createdAt: true,
    updatedAt: true,
    paranoid: true,     // 此次以后，该表的数据不会真正的被删除，而是加上一行 deleteAt
})