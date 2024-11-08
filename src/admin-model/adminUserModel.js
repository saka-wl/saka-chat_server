
const { DataTypes } = require('sequelize')
const sequelize = require('../db/db')

module.exports = sequelize.define("AdminUser", {
    account: {
        type: DataTypes.STRING,
        allowNull: false,
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
    // 1 - 普通管理员 2 - 超级管理员
    level: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 1
    }
}, {
    freezeTableName: true,
    createdAt: true,
    updatedAt: true,
    paranoid: true,     // 此次以后，该表的数据不会真正的被删除，而是加上一行 deleteAt
})