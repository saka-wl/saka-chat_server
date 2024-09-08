const { DataTypes } = require('sequelize')
const sequelize = require('../db/db')

module.exports = sequelize.define("User", {
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    account: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nickname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isOnline: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    socketId: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    freezeTableName: true,
    createdAt: true,
    updatedAt: true,
    paranoid: true,     // 此次以后，该表的数据不会真正的被删除，而是加上一行 deleteAt
})