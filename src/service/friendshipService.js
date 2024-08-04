
const FriendRequestModel = require("../model/friendRequestModel")
const UserModel = require("../model/userModel")
const { Op } = require("sequelize");
const { objFormat } = require("../utils/format");

exports.sendFriendRequst = async ({
    fromUserId,
    toUserId,
    requestMessage
}) => {
    FriendRequestModel.create({
        fromUserId,
        toUserId,
        requestMessage,
        isDispose: 0
    })

}

exports.getAllRequestToMe = async (toUserId) => {
    const resp = await FriendRequestModel.findAndCountAll({ where: { toUserId } })
    console.log(resp)
}

exports.getAllRequestFromMe = async (fromUserId) => {
    const requestRows = await FriendRequestModel.findAll({ where: { fromUserId } })
    const needUserInfoArr = requestRows.map(it => it?.dataValues?.toUserId)
    const toUserRows = await UserModel.findAll({ where: { id: { [Op.or]: needUserInfoArr } }, order: [['createdAt', 'DESC']] })
    const res = []
    for (let i = 0; i < requestRows.length; i++) {
        res[i] = {
            requestInfo: {
                ...objFormat(requestRows[i].dataValues, 1, 'updatedAt', 'deletedAt', 'password')
            },
            toUserInfo: {
                ...objFormat(
                    toUserRows.find(it => it.id == requestRows[i].toUserId)?.dataValues,
                    1, 'createdAt', 'updatedAt', 'deletedAt', 'password', 'phone', 'email'
                )
            }
        }
    }
    return res
}