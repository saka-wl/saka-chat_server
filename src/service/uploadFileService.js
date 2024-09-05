
const { objFormat, returnFormat, isValueNull } = require("../utils/format");
const LargeFileModel = require("../model/largeFileModel");
const { combineFile } = require("../utils/file");

/**
 * 
 * @param {*} data fileId fileName ownUserId fileUploadInfo 必传
 * @returns 
 */
exports.editNewFileInfo = async (data) => {
    data = objFormat(data, 0, 'fileId', 'pwd', 'fileName', 'ownUserId', 'fileUploadInfo');
    data.fileType = 2;
    if (data.fileName.endsWith('.mp4')) data.fileType = 4;
    data.pwd = !isValueNull(data.pwd) ? data.pwd : null;
    if (data.fileUploadInfo && typeof data.fileUploadInfo === 'object') {
        data.fileUploadInfo = JSON.stringify(data.fileUploadInfo);
    }
    const hasUploadedSamedFiles = await LargeFileModel.findAll({ where: { fileId: data.fileId } });
    let targetTmpFile = null;
    for(let item of hasUploadedSamedFiles) {
        item = item.dataValues;
        if(!targetTmpFile) {
            targetTmpFile = item;
            continue;
        }
        const targetTmpFileInfo = JSON.parse(targetTmpFile.fileUploadInfo);
        if(targetTmpFileInfo.needUploadedHash && targetTmpFileInfo.needUploadedHash.length === 0) break;
        const itemFileInfo = JSON.parse(item.fileUploadInfo);
        if(itemFileInfo.needUploadedHash && targetTmpFileInfo.needUploadedHash && itemFileInfo.needUploadedHash.length < targetTmpFileInfo.needUploadedHash.length) {
            targetTmpFile = item;
        }
    }
    if(!targetTmpFile) {
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
    // 创建过相同文件
    let curUserFile = await LargeFileModel.findAll({ where: { fileId: data.fileId, fileName: data.fileName, ownUserId: data.ownUserId } });
    if(curUserFile && curUserFile.length > 0) {
        // 该用户创建过名字一样的文件
        await LargeFileModel.update({ fileUploadInfo: targetTmpFile.fileUploadInfo }, { where: { fileId: data.fileId, fileName: data.fileName, ownUserId: data.ownUserId } });
        curUserFile = curUserFile[0].dataValues;
    }else{
        curUserFile = await LargeFileModel.create({ ... data, fileUploadInfo: targetTmpFile.fileUploadInfo });
        curUserFile = curUserFile.dataValues;
    }
    return returnFormat(
        200,
        {
            id: curUserFile.id,
            needUploadedHash: JSON.parse(targetTmpFile.fileUploadInfo).needUploadedHash,
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
    const tmp = { ... resp };
    tmp.fileUploadInfo = JSON.stringify(tmp.fileUploadInfo);
    await LargeFileModel.update(tmp, { where: { fileId: data.fileId, id: data.id } });

    if(resp.fileUploadInfo.needUploadedHash.length === 0) {
        // 返回文件合并路径
        const fileCombinePath = await combineFile(resp.fileUploadInfo.hasUploadedHash, resp.fileId, resp.fileName);
        return returnFormat(200, fileCombinePath, '');
    }
    return returnFormat(200, resp.fileUploadInfo.needUploadedHash, '');
}

exports.getFileInfo = async (data) => {
    data.pwd = !isValueNull(data.pwd) ? data.pwd : null;
    const resp = await LargeFileModel.findAll({ where: { ... data } });
    const result = [];
    for(let item of resp) {
        item = item.dataValues;
        item.pwd = "***";
        item = objFormat(item, 1, 'createdAt', 'updatedAt', 'deletedAt', 'pwd');
        result.push(item)
    }
    return result;
}