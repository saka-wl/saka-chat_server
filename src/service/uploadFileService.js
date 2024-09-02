
const { objFormat, returnFormat } = require("../utils/format");
const LargeFileModel = require("../model/largeFileModel");
const { combineFile } = require("../utils/file");

/**
 * 
 * @param {*} data fileId fileName ownUserId fileUploadInfo 必传
 * @returns 
 */
exports.editNewFileInfo = async (data) => {
    data = objFormat(data, 0, 'fileId', 'pwd', 'fileName', 'ownUserId', 'fileUploadInfo');
    if (data.fileUploadInfo && typeof data.fileUploadInfo === 'object') {
        data.fileUploadInfo = JSON.stringify(data.fileUploadInfo);
    }
    const resp = await LargeFileModel.findAll({ where: { fileId: data.fileId, fileName: data.fileName, ownUserId: data.ownUserId } });
    if(!resp || resp.length === 0) {
        // 还未创建
        const resp = await LargeFileModel.create(data);
        return returnFormat(
            200, 
            {
                id: resp.dataValues.id,
                needUploadedHash: null
            }, 
            "文件md5信息创建成功！"
        );
    }
    return returnFormat(
        200,
        {
            id: resp[0].dataValues.id,
            needUploadedHash: JSON.parse(resp[0].dataValues.fileUploadInfo).needUploadedHash
        },
        ''
    );
}

/**
 * 添加文件切片chunk
 * @param {*} data 
 * 返回 文件还需要上传的数组
 */
exports.addFileChunk = async (data) => {
    if(!data.ownUserId) data.ownUserId = '0';
    let [resp] = await LargeFileModel.findAll({ where: { fileId: data.fileId, id: data.id } });
    if(!resp) {
        // TODO - 文件上传信息删除
        return returnFormat(200, null, '文件上传信息错误，请重新上传');
    }
    resp = resp.dataValues;
    resp.fileUploadInfo = JSON.parse(resp.fileUploadInfo);
    resp.fileUploadInfo.hasUploadedHash.push(data.chunkHash);
    resp.fileUploadInfo.needUploadedHash = resp.fileUploadInfo.needUploadedHash.filter(it => it !== data.chunkHash);
    const tmp = { ... resp};
    tmp.fileUploadInfo = JSON.stringify(tmp.fileUploadInfo);
    await LargeFileModel.update(tmp, { where: { fileId: data.fileId } });

    if(resp.fileUploadInfo.needUploadedHash.length === 0) {
        // 返回文件合并路径
        const fileCombinePath = await combineFile(resp.fileUploadInfo.hasUploadedHash, resp.fileId, resp.fileName);
        return returnFormat(200, fileCombinePath, '');
    }
    return returnFormat(200, resp.fileUploadInfo.needUploadedHash, '');
}