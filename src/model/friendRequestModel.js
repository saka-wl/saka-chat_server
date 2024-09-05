const { DataTypes } = require('sequelize')
const sequelize = require('../db/db')

module.exports = sequelize.define("FriendRequest", {
    fromUserId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    toUserId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    requestMessage: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // -1 拒绝； 0 待处理； 1 同意
    isDispose: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: false
    }
}, {
    freezeTableName: true,
    createdAt: true,
    updatedAt: true,
    paranoid: true,     // 此次以后，该表的数据不会真正的被删除，而是加上一行 deleteAt
})