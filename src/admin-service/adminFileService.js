const { isValueNull, objFormat } = require("../utils/format");
const largeFileModel = require("../model/largeFileModel");
const chatMessageModel = require("../model/chatMessageModel");
const path = require("path");
const { Op } = require("sequelize");
const fs = require('fs').promises;

exports.getFilesByCondition = async (data) => {
    if(isValueNull(data?.page)) data.page = 0;
    if(isValueNull(data?.limit)) data.limit = 10;
    const params = objFormat(data, 1, 'page', 'limit');
    return await largeFileModel.findAndCountAll({
        where: { ...params },
        offset: data.page * data.limit,
        limit: data.limit
    })
}

exports.forbidFile = async (id, status) => {
    await largeFileModel.update({ status }, { where: { id } });
}

const removeFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
    }catch(err) {
        console.log(err);
    }
}

exports.deleteFile = async (id) => {
    let resp = await largeFileModel.findOne({ where: { id } });
    if(!resp.dataValues) return;
    let { fileId, fileUploadInfo, fileName } = resp.dataValues;
    fileUploadInfo = JSON.parse(fileUploadInfo);
    // 先删除文件夹中的文件
    if(fileUploadInfo.needUploadedHash && fileUploadInfo.needUploadedHash.length === 0) {
        // 先删整体文件
        // console.log(path.resolve(__dirname, '../', 'files', 'largeFiles', 'file', fileId + fileName.substring(fileName.lastIndexOf('.'))));
        await removeFile(path.resolve(__dirname, '../', 'files', 'largeFiles', 'file', fileId + fileName.substring(fileName.lastIndexOf('.'))));
    }
    // 删除文件段
    for(let item of fileUploadInfo.hasUploadedHash) {
        // console.log(path.resolve(__dirname, '../', 'files', 'largeFiles', 'fileStream', item))
        await removeFile(path.resolve(__dirname, '../', 'files', 'largeFiles', 'fileStream', item));
    }
    await largeFileModel.destroy({ where: { id }, force: true });
    await chatMessageModel.destroy({ where: { messageType: { [Op.or]: ['file', 'video'] }, messageInfo: id.toString() }, force: true });
}