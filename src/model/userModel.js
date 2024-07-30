const { DataTypes } = require('sequelize')
const sequelize = require('../db/db')

module.exports = sequelize.define("User", {
    loginId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    account: {
        type: DataTypes.STRING,
        allowNull: false
    },
    loginPwd: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nickname: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false,
    paranoid: true,     // 此次以后，该表的数据不会真正的被删除，而是加上一行 deleteAt
})