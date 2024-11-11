
// const { DataTypes } = require('sequelize')
// const sequelize = require('../db/db')

// module.exports = sequelize.define("UserAccessToken", {
//     // 0 - 封禁 1 - 正常
//     status: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     userId: {
//         type: DataTypes.STRING,
//         allowNull: false
//     },
//     userName: {
//         type: DataTypes.STRING,
//         allowNull: true
//     },
//     account: {
//         type: DataTypes.STRING,
//         allowNull: true
//     }
// }, {
//     freezeTableName: true,
//     createdAt: true,
//     updatedAt: true,
//     paranoid: true,     // 此次以后，该表的数据不会真正的被删除，而是加上一行 deleteAt
// })