const { DataTypes } = require('sequelize')
const sequelize = require('../db/db')

module.exports = sequelize.define("userToMdFile", {
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mdFileId: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    freezeTableName: true,
    createdAt: true,
    updatedAt: true,
    paranoid: true,     // 此次以后，该表的数据不会真正的被删除，而是加上一行 deleteAt
})