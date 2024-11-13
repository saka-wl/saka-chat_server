
const chatRoomGroupModel = require('../model/chatRoomGroupModel');
const userModel = require('../model/userModel');
const chatRoomGroupIdToUserIdModel = require('../model/chatRoomGroupIdToUserIdModel')
const { returnFormat } = require('../utils/format');

/**
 * 创建新的群聊
 * 1. 在群聊表中创建新数据
 * 2. 在用户表中添加该群聊id
 * @param {*} obj 
 * @returns 
 */
exports.createChatRoomGroup = async (obj) => {
  // 1. 在群聊表中创建新数据
  const resp = await chatRoomGroupModel.create(obj);
  // 2. 在用户表中添加该群聊id
  const data = [];
  for(let item of humanIds) {
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
exports.getChatRoomGroupList = async (userId) => {
  const userInfo = await userModel.findOne({ where: { id: userId } });
  if (!userInfo.dataValues) return returnFormat(404, null, "用户id不存在！");
  let chatRoomIds = userInfo.dataValues.myGroupChatIds;
  try {
    chatRoomIds = JSON.parse(chatRoomIds);
  } catch (err) {
    return returnFormat(404, null, "用户存储的群聊id不为JSON格式！");
  }

}