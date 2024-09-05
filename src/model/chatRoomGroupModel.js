const { DataTypes } = require('sequelize')
const sequelize = require('../db/db')

module.exports = sequelize.define("ChatRoomGroup", {
    chatRoomName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    makerUserId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    humanNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    humanIds: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    freezeTableName: true,
    createdAt: true,
    updatedAt: true,
    paranoid: true,     // 此次以后，该表的数据不会真正的被删除，而是加上一行 deleteAt
})