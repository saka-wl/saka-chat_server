
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
    let resp = await LargeFileModel.findAll({ where: { fileId: data.fileId, fileName: data.fileName, ownUserId: data.ownUserId } });
    if(!resp && resp.length === 0) {
        // 还未创建
        await LargeFileModel.create(data);
        return {
            code: 200,
            data: data.fileUploadInfo,
            message: '文件md5信息创建成功！',
        };
    }
    resp = resp[0].dataValues;
    if(JSON.parse(resp.fileUploadInfo).length === 0) {
        // 已经上传过改文件了
        return {
            code: 200,
            data: [],
            message: '文件已经上传完成！',
        }
    }
    // 已经创建过了，需要修改md5记录信息的状态
    await LargeFileModel.update(data, { where: { fileId: data.fileId, fileName: data.fileName, ownUserId: data.ownUserId } });
    return {
        code: 200,
        data: data.fileUploadInfo,
        message: '文件分片信息更新成功！'
    }
}

/**
 * 添加文件切片chunk
 * @param {*} data 
 * 返回 文件还需要上传的数组
 */
exports.addFileChunk = async (data) => {
    let [resp] = await LargeFileModel.findAll({ where: { fileId: data.fileId } });
    if(!resp) {
        // TODO - 文件上传信息删除
        return {
            code: 200,
            data: undefined,
            message: '文件上传信息错误，请重新上传',
        };
    }
    resp = resp.dataValues
    resp.fileUploadInfo.hasUploadedHash.push(data.chunkHash);
    resp.fileUploadInfo.needUploadedHash = resp.fileUploadInfo.needUploadedHash.filter(it => it !== data.chunkHash);
    if(resp.fileUploadInfo.needUploadedHash.length === 0) {
        // 返回文件合并路径
        const fileCombinePath = await combineFile(resp.fileUploadInfo.hasUploadedHash, resp.fileId, resp.fileName);
        return {
            code: 200,
            data: fileCombinePath,
            message: '',
        }
    }
    await LargeFileModel.update(resp, { where: { fileId: data.fileId } });
    return {
        code: 200,
        data: resp.fileUploadInfo.needUploadedHash,
        message: '',
    };
}