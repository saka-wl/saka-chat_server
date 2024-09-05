
const FriendRequestModel = require("../model/friendRequestModel")
const UserModel = require("../model/userModel")
const { Op } = require("sequelize");
const { objFormat } = require("../utils/format");
const UserFriendModel = require("../model/userFriendModel");
const ChatRoomModel = require("../model/chatRoomModel");

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

exports.getAllRequestToMe = async (toUserId) => {
    const requestRows = await FriendRequestModel.findAll({ where: { toUserId } })
    const needUserInfoArr = requestRows.map(it => it?.dataValues?.fromUserId)
    const toUserRows = await UserModel.findAll({ where: { id: { [Op.or]: needUserInfoArr } }, order: [['createdAt', 'DESC']] })
    const res = []
    for (let i = 0; i < requestRows.length; i++) {
        res[i] = {
            requestInfo: {
                ...objFormat(requestRows[i].dataValues, 1, 'updatedAt', 'deletedAt', 'password')
            },
            toUserInfo: {
                ...objFormat(
                    toUserRows.find(it => it.id == requestRows[i].fromUserId)?.dataValues,
                    1, 'createdAt', 'updatedAt', 'deletedAt', 'password', 'phone', 'email'
                )
            }
        }
    }
    return res
}

exports.handleFriendRequest = async ({ requestId, isDispose, friendId, userId }) => {
    FriendRequestModel.update({ isDispose }, { where: { id: requestId } })
    if (isDispose === -1) {
        return true;
    }
    const chatRoom = await ChatRoomModel.create({
        friendId,
        userId,
        totalMessageIndex: 0,
        newMessageIndex: 0,
        deleteMessageIndex: -1
    })
    await UserFriendModel.create({
        chatRoomId: chatRoom.dataValues.id,
        userId,
        friendId
    })
    return true
}