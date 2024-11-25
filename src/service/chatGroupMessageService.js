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
    for(let item of humanIds) {
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