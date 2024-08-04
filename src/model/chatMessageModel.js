
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
    }
}, {
    freezeTableName: true,
    createdAt: true,
    updatedAt: true,
    paranoid: true,     // 此次以后，该表的数据不会真正的被删除，而是加上一行 deleteAt
})