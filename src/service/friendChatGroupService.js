
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
  if(obj.chatRoomName) {
    searchQuery.chatRoomName = {
      [Op.like]: '%' + obj.chatRoomName + '%'
    }
  }
  if(obj.id) {
    searchQuery = { id: obj.id };
  }
  const resp = await chatRoomGroupModel.findAll({
    where: searchQuery
  });
  const data = resp.map(it => (it.dataValues));
  return returnFormat(200, data, '');
}

/**
 * 发出关于群聊添加人员的请求
 * @param {*} obj 
 * @returns 
 */
exports.sendGroupChatRequest = async (obj) => {
  const addQuery = { ... obj };
  addQuery.status = 0;
  // 群聊邀请用户  ||  用户申请主动加入群聊
  const resp = await chatRoomGroupRequestModel.create(addQuery);
  return returnFormat(200, resp.dataValues, '');
}

/**
 * 查询所有的群聊请求
 * @param {*} obj 
 */
exports.getChatRoomGroupRequestListByCondition = async (obj) => {
  const resp = await chatRoomGroupRequestModel.findAll({
    where: obj
  });
  const data = resp.map(it => (it.dataValues));
  return returnFormat(200, data, '');
}