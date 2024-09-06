const { DataTypes } = require('sequelize')
const sequelize = require('../db/db')

module.exports = sequelize.define("LargeFile", {
    fileName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pwd: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ownUserId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // 文件的 md5
    fileId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // 1 正常； 0 删除； -1 封禁
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    /**
     * 文件的剩余hash与已上传hash
     * {
     *   fileId: ...,
     *   hasUploadedHash: [],
     *   needUploadedHash: [],
     * }
     */
    fileUploadInfo: {
        type: DataTypes.STRING(2000),
        allowNull: true
    },
    // 1 -> 普通文件；2 -> 大文件；3 -> 视频流小文件；4 -> 视频流大文件
    fileType: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    // ['....png', '....png', ...]
    videoPreview: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    freezeTableName: true,
    createdAt: true,
    updatedAt: true,
    paranoid: true,     // 此次以后，该表的数据不会真正的被删除，而是加上一行 deleteAt
})