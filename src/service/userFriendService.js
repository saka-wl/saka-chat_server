
const { Op } = require("sequelize")
const UserFriendModel = require("../model/userFriendModel")
const { objFormat } = require("../utils/format")
const userModel = require("../model/userModel")

exports.getAllMyFriend = async (userId) => {
    let resp = await UserFriendModel.findAll({
        where: {
            [Op.or]: [
                { userId: userId },
                { friendId: userId }
            ]
        }
    })
    let needUserInfo = new Set()
    resp = resp.map(it => {
        if(userId != it.userId) {
            needUserInfo.add(it.userId)
        }
        if(userId != it.friendId) {
            needUserInfo.add(it.friendId)
        }
        return objFormat(it.dataValues, 1, 'updatedAt', 'createdAt', 'deletedAt')
    })
    needUserInfo = Array.from(needUserInfo)
    const userInfos = await userModel.findAll({ where: { id: { [Op.or]: needUserInfo } } })
    resp = resp.map(it => {
        let tmp = -1
        if(userId != it.userId) {
            tmp = it.userId
        }
        if(userId != it.friendId) {
            tmp = it.friendId
        }
        const friendInfo = userInfos.find(it => it.id == tmp)
        return {
            ... it,
            friendAccount: friendInfo?.account,
            friendNickname: friendInfo?.nickname,
            friendAvatar: friendInfo?.avatar,
            friendEmail: friendInfo?.email,
            isOnline: friendInfo?.isOnline,
        }
    })
    return resp
}