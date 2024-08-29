
const { Op } = require("sequelize");
const { objFormat } = require("../utils/format");
const LargeFileModel = require("../model/largeFileModel");

/**
 * 
 * @param {*} data fileId fileName ownUserId fileUploadInfo 必传
 * @returns 1 -> 初次创建；0 -> 文件上传过了，返回还需要的md5信息
 */
exports.editNewFileInfo = async (data) => {
    data = objFormat(data, 0, 'fileId', 'pwd', 'fileName', 'ownUserId', 'fileUploadInfo');
    if (data.fileUploadInfo && typeof fileUploadInfo === 'object') {
        data.fileUploadInfo = JSON.stringify(data.fileUploadInfo);
    }
    data.status = 1;
    const resp = await LargeFileModel.findAll({ where: { fileId: data.fileId, fileName: data.fileName, ownUserId: data.ownUserId } });
    // 已经创建过了，需要修改md5记录信息的状态
    if (resp && resp.length > 0) {
        await LargeFileModel.update(data, { where: { fileId: data.fileId, fileName: data.fileName, ownUserId: data.ownUserId } })
        return 0;
    }
    await LargeFileModel.create(data);
    return 1;
}