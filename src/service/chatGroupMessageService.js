const { Op } = require("sequelize");
const chatGroupMessageModel = require("../model/chatGroupMessageModel");
const chatRoomGroupModel = require("../model/chatRoomGroupModel");
const userModel = require("../model/userModel");
const { objFormat, returnFormat } = require("../utils/format");


/**
 * 查询聊天记录
 */
exports.getChatGroupMessageByChatRoomId = async (chatRoomId) => {
    let chatRoomInfo = await chatRoomGroupModel.findOne({ where: { id: ~~chatRoomId } });
    chatRoomInfo = chatRoomInfo.dataValues;
    const humanIds = JSON.parse(chatRoomInfo.humanIds).map(it => ~~it);
    const usersDatas = (await userModel.findAll({ where: { id: { [Op.or]: humanIds } } })).map(it => it.dataValues);
    const usersInfo = {};
    for (let item of humanIds) {
        item = ~~item;
        const elem = usersDatas.find(it => it.id === item);
        usersInfo[item] = {
            nickname: elem.nickname,
            isOnline: elem.isOnline,
            avatar: elem.avatar
        }
    }
    const { count, rows } = await chatGroupMessageModel.findAndCountAll({ where: { chatRoomId: chatRoomId?.toString() } });
    const data = rows.map(it => objFormat(it.dataValues, 1, 'deletedAt', 'updatedAt'));
    return returnFormat(200, { chatMsg: data, usersInfo }, '');
}

exports.getChatGroupAllNewMessages = async (userId) => {
    // 获取我未读取的消息
    let newMessages = await chatGroupMessageModel.findAll({
        where: {
            [Op.or]: [
                {
                    notReadedUserIds: {
                        [Op.like]: `%"${~~userId}"%`
                    }
                },
                {
                    notReadedUserIds: {
                        [Op.like]: `%'${~~userId}'%`
                    }
                },
            ]
        }
    });
    const newMsgRes = {};
    for(let item of newMessages) {
        item = item.dataValues;
        if(!newMsgRes[item.chatRoomId]) {
            newMsgRes[item.chatRoomId] = 1;
        }
        newMsgRes[item.chatRoomId] = newMsgRes[item.chatRoomId] + 1;
    }
    // 获取最近5天的消息
    let oldMessages = await chatGroupMessageModel.findAll({
        where: {
            [Op.or]: [
                {
                    toUserIds: {
                        [Op.like]: `%${~~userId}%`
                    }
                },
                {
                    fromUserId: ~~userId
                }
            ],
            createdAt: {
                [Op.gt]: new Date(new Date() - 5 * 24 * 60 * 60 * 1000)
            }
        }
    });
    const oldMsgRes = {};
    for(let item of oldMessages) {
        item = item.dataValues;
        if(!oldMsgRes[item.chatRoomId]) {
            oldMsgRes[item.chatRoomId] = 1;
        }
        oldMsgRes[item.chatRoomId] = oldMsgRes[item.chatRoomId] + 1;
    }
    return returnFormat(200, { newMsgRes, oldMsgRes }, '');
}