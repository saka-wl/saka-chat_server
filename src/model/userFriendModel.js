const { DataTypes } = require('sequelize')
const sequelize = require('../db/db')

module.exports = sequelize.define("UserFriend", {
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    friendId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    chatRoomId: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    freezeTableName: true,
    createdAt: true,
    updatedAt: true,
    paranoid: true,     // 此次以后，该表的数据不会真正的被删除，而是加上一行 deleteAt
})