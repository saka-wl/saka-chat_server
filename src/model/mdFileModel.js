const { DataTypes } = require('sequelize')
const sequelize = require('../db/db')

module.exports = sequelize.define("MdFile", {
    fileTitle: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileContent: {
        type: DataTypes.STRING(3000),
        allowNull: false
    },
    // 文档归属者
    ownUserId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // 协作者ids
    collaborateUserIds: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    freezeTableName: true,
    createdAt: true,
    updatedAt: true,
    paranoid: true,     // 此次以后，该表的数据不会真正的被删除，而是加上一行 deleteAt
})