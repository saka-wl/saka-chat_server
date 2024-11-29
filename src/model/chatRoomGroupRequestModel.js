const { DataTypes } = require('sequelize')
const sequelize = require('../db/db')

module.exports = sequelize.define("ChatRoomGroupRequest", {
    chatRoomName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // 邀请/申请发起人
    fromUserId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // 邀请/申请接收人
    toUserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    chatRoomId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    requestDesc: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // 0 - 由群主发起的群聊邀请   1 - 由用户发起的加群请求
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0  
    },
    // 0 - 处理中  1 - 已允许  2 - 已拒绝
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    chatRoomAvatar: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    freezeTableName: true,
    createdAt: true,
    updatedAt: true,
    paranoid: true,     // 此次以后，该表的数据不会真正的被删除，而是加上一行 deleteAt
})