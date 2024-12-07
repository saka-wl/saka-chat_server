
const { objFormat, returnFormat, isValueNull } = require("../utils/format");
const LargeFileModel = require("../model/largeFileModel");
const { combineFile, totalFileCheck } = require("../utils/file");

/**
 * 简介：点击上传之后调用的函数，会在数据库中新创建一个 文件记录
 * 1. 找到该fileId的文件的上传的最新状态
 * 2. 进行文件校验
 * @param {*} data fileId fileName ownUserId fileUploadInfo 必传
 * @returns 
 */
exports.editNewFileInfo = async (data) => {
    data = objFormat(data, 0, 'fileId', 'pwd', 'fileName', 'ownUserId', 'fileUploadInfo', 'videoPreview', 'isNeedCheck');
    data.fileType = 2;
    if (data.fileName.endsWith('.mp4')) data.fileType = 4;
    data.pwd = !isValueNull(data.pwd) ? data.pwd : null;
    if (data.fileUploadInfo && typeof data.fileUploadInfo === 'object') {
        data.fileUploadInfo = JSON.stringify(data.fileUploadInfo);
    }
    const hasUploadedSamedFiles = await LargeFileModel.findAll({ where: { fileId: data.fileId } });
    let targetTmpFile = null;
    // 下面的for循环判断是否有用户创建过相同的文件，如果有，对比得到哪个文件的上传进度最大，然后直接复用这个文件的上传进度以及文件切片
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
    if(data.isNeedCheck !== true) {
        // 不需要校验
        return returnFormat(
            200,
            {
                id: curUserFile.id,
                needUploadedHash: JSON.parse(targetTmpFile.fileUploadInfo).needUploadedHash,
            },
            ''
        );
    }

    // 需要校验文件
    // 对于点击了开始上传，第一次上传的切片，我们需要检测文件上传的完整性（验证数据库中的数据与文件切片中的数据是否一致）
    const resp = await totalFileCheck(curUserFile.id);
    if(resp === true) {
        // 文件校验没问题
        return returnFormat(
            200,
            {
                id: curUserFile.id,
                needUploadedHash: JSON.parse(targetTmpFile.fileUploadInfo).needUploadedHash,
            },
            ''
        );
    }
    const { code, fileInfo, msg } = resp;
    if(fileInfo && fileInfo.needUploadedHash) {
        // 文件校验出现问题，返回最新的数据
        return returnFormat(
            200,
            {
                id: curUserFile.id,
                needUploadedHash: fileInfo.needUploadedHash,
            },
            ''
        );
    }
    return returnFormat(code, fileInfo, msg);
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
        const { code, fileInfo, msg } = await combineFile(resp.fileUploadInfo.hasUploadedHash, resp.fileId, resp.fileName, data.id);
        return returnFormat(code, fileInfo, msg);
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