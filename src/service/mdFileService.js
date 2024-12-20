
const { Op } = require("sequelize");
const MdFileModel = require("../model/mdFileModel");
const UserToMdFileModel = require('../model/userToMdFileModel');
const { objFormat } = require("../utils/format");

exports.createMdFile = async (data) => {
    const collaborateUserIds = data.collaborateUserIds;
    if (typeof data.collaborateUserIds === 'object') {
        data.collaborateUserIds = JSON.stringify(data.collaborateUserIds);
    }
    data = objFormat(data, 0, 'ownUserId', 'collaborateUserIds', 'fileContent', 'fileTitle');
    const resp = await MdFileModel.create(data);
    // 添加协作者数据库
    const tmp = [];
    const mdFileId = resp.dataValues.id;
    for (let item of collaborateUserIds) {
        tmp.push({
            mdFileId,
            userId: item,
        });
    }
    await UserToMdFileModel.bulkCreate(tmp);
}

exports.changeMdFile = async (data) => {
    await MdFileModel.update({ fileContent: data.fileContent }, { where: { id: data.id } });
}

exports.getMdFileContent = async (id) => {
    const resp = await MdFileModel.findOne({ where: { id } });
    return resp.dataValues;
}

exports.getMdFilesList = async (userId) => {
    // 获取协作文档的ids
    let tmp = await UserToMdFileModel.findAll({ where: { userId } });
    tmp = tmp.map(item => item.dataValues.mdFileId);

    // 获取所属文档
    let ownMdFiles = await MdFileModel.findAll({
        where: {
            [Op.or]: [
                { ownUserId: userId.toString() },
                { id: { [Op.or]: tmp } }
            ]
        }
    });
    return ownMdFiles.map(item => {
        delete item.dataValues.fileContent;
        return item.dataValues;
    });
}