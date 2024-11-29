
const chatRoomGroupModel = require('../model/chatRoomGroupModel');
const userModel = require('../model/userModel');
const chatRoomGroupIdToUserIdModel = require('../model/chatRoomGroupIdToUserIdModel')
const { returnFormat, objFormat } = require('../utils/format');
const { Op } = require('sequelize');
const chatRoomGroupRequestModel = require('../model/chatRoomGroupRequestModel');

/**
 * 创建新的群聊
 * 1. 在群聊表中创建新数据
 * 2. 在用户表中添加该群聊id
 * @param {*} obj 
 * @returns 
 */
exports.createChatRoomGroup = async (obj) => {
  // 1. 在群聊表中创建新数据
  obj.humanIds.push(obj.makerUserId?.toString());
  const resp = await chatRoomGroupModel.create({ ...obj, humanIds: JSON.stringify(obj.humanIds) });
  // 2. 在用户表中添加该群聊id
  const data = [];
  for (let item of obj.humanIds) {
    data.push({
      chatRoomGroupId: resp.dataValues.id,
      userId: item
    })
  }
  await chatRoomGroupIdToUserIdModel.bulkCreate(data);
  return returnFormat(200, resp.dataValues, '');
}

/**
 * 获取所有的群聊
 * @param {*} userId 
 * @returns 
 */
exports.getChatRoomGroupListByCondition = async (obj) => {
  let searchQuery = obj;
  if (obj.chatRoomName) {
    searchQuery.chatRoomName = {
      [Op.like]: '%' + obj.chatRoomName + '%'
    }
  }
  if (obj.id) {
    searchQuery = { id: obj.id };
  }
  const resp = await chatRoomGroupModel.findAll({
    where: searchQuery
  });
  const data = resp.map(it => (it.dataValues));
  return returnFormat(200, data, '');
}

/**
 * 获取某个用户的所有群聊
 * @param {*} userId 
 */
exports.getAllChatRoomGroupByUserId = async (userId) => {
  let allChatRoomGroupIdToUserIds = await chatRoomGroupIdToUserIdModel.findAll({ where: { userId } });
  const allChatRoomIds = [];
  for (let item of allChatRoomGroupIdToUserIds) {
    allChatRoomIds.push(item.dataValues.chatRoomGroupId)
  }
  if(allChatRoomIds.length === 0) return returnFormat(200, [], '');
  const allChatGroupRooms = await chatRoomGroupModel.findAll({
    where: {
      id: {
        [Op.or]: allChatRoomIds
      }
    }
  });
  return returnFormat(200, allChatGroupRooms.map(it => objFormat(it.dataValues, 1, 'createdAt', 'updatedAt', 'deletedAt')));
}

/**
 * 发出关于群聊添加人员的请求
 * @param {*} obj 
 * @returns 
 */
exports.sendGroupChatRequest = async (obj) => {
  obj.status = 0;
  if(!obj.toUserIds) {
    // 群聊邀请用户  ||  用户申请主动加入群聊
    const resp = await chatRoomGroupRequestModel.create(obj);
    return returnFormat(200, resp.dataValues, '');
  }
  const tmp = [];
  for(let item of obj.toUserIds) {
    tmp.push({
      ... obj,
      toUserId: ~~item
    })
  }
  console.log(tmp);
  const resp = await chatRoomGroupRequestModel.bulkCreate(tmp);
  return returnFormat(200, resp.dataValues, '');
}

/**
 * 查询所有的群聊请求
 * @param {*} obj 
 */
exports.getChatRoomGroupRequestListByCondition = async (obj) => {
  if(obj.userId) {
    obj = {
      [Op.or]: [
        { fromUserId: obj.userId },
        { toUserId: obj.userId },
      ]
    }
  }
  const resp = await chatRoomGroupRequestModel.findAll({
    where: obj
  });
  const data = resp.map(it => (it.dataValues));
  return returnFormat(200, data, '');
}

/**
 * 用户加入群聊
 * 1. 修改 chatRoomGroupRequestModel 群聊请求状态
 * 2. 添加 chatRoomGroupIdToUserIdModel 的对应关系
 * 3. 添加 chatRoomGroupModel 中的 humanIds 的信息
 * @param {*} status 
 * @param {*} requestId 
 * @param {*} userId 
 * @param {*} chatRoomId 
 */
exports.addChatGroupRoom = async ({ status, requestId, userId, chatRoomId }) => {
  if (status === 2) {
    // 拒绝加入/申请
    await chatRoomGroupRequestModel.update({ status: 2 }, { where: { id: requestId } });
    return returnFormat(200, null, '处理成功！');
  }
  await chatRoomGroupRequestModel.update({ status: 1 }, { where: { id: requestId } });
  await chatRoomGroupIdToUserIdModel.create({
    chatRoomGroupId: chatRoomId,
    userId
  });
  const { dataValues } = await chatRoomGroupModel.findOne({ where: { id: chatRoomId } });
  let humanIds = [];
  try {
    humanIds = JSON.parse(dataValues.humanIds);
  } catch (err) { };
  humanIds.push(~~userId);
  await chatRoomGroupModel.update({ humanIds: JSON.stringify(humanIds) }, { where: { id: chatRoomId } });
  return returnFormat(200, true, '加入成功！');
}