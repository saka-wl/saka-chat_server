
const { Op } = require("sequelize")
const { objFormat, returnFormat, isValueNull, deleteObjNullKeys } = require("../utils/format")
const largeFileModel = require("../model/largeFileModel")
const path = require("path");
const { readFile } = require("fs/promises");
const sparkmd5 = require('../utils/sparkMd5');

exports.getFilesByCondition = async (data, page) => {
    data = objFormat(data, 0, 'id', 'fileName', 'status');
    data = deleteObjNullKeys(data);
    if (data.id) {
        let resp = await largeFileModel.findAll({ where: { id: data.id, status: 1 } });
        resp = resp.map(it => it.dataValues);
        return returnFormat(200, resp, '');
    }
    // if(!page.limit) page.limit = 7;
    // if(!page.page && page.page === 0) page.page = 0;
    // let resp = await largeFileModel.findAll({ where: { ... data }, limit: page.limit, offset: (page.page - 1) * page.limit });
    let resp = await largeFileModel.findAll({
        where: {
            [Op.or]: [
                {
                    fileName: {
                        [Op.like]: '%' + data.fileName + '%'
                    },
                    status: 1
                },
                { ...data, status: 1 }
            ]
        }
    });
    resp = resp.map(it => {
        it.dataValues.pwd = "***";
        return it.dataValues
    });
    return returnFormat(200, resp, '');
}

exports.getFilesFromMine = async (ownUserId, userId) => {
    if (!ownUserId) return returnFormat(200, null, '');
    if (userId != ownUserId) return returnFormat(200, null, '您无修改权限！');

    let resp = await largeFileModel.findAll({ where: { ownUserId: ownUserId } });
    resp = resp.map(it => {
        it.dataValues.pwd = "***";
        return it.dataValues
    });
    return returnFormat(200, resp, '');
}

exports.changeFileInfo = async (data, where) => {
    data = objFormat(data, 0, 'status', 'pwd');
    data = deleteObjNullKeys(data);
    if (Object.keys(data).length === 0) return;
    await largeFileModel.update(data, { where });
}

const getFileChunkMD5Info = async (filePath) => {
    const spark = new sparkmd5.ArrayBuffer();
    const buffer = await readFile(filePath);
    spark.append(buffer);
    const hash = spark.end();
    if (hash === filePath) {
        return true;
    }
    return filePath;
}

/**
 * 异步查看文件是否存在
 * @param {*} path
 * @returns
 */
async function isFileExists(path) {
    try {
        await fs.promises.stat(path);
        return true;
    } catch {
        return false;
    }
}

exports.checkFileChunks = async (id) => {
    const resp = (await largeFileModel.findOne({ where: { id: ~~id } }))?.dataValues;
    let fileInfo = JSON.parse(resp.fileUploadInfo);
    let { hasUploadedHash } = fileInfo;
    const allFileChunks = [... hasUploadedHash];
    const { fileName } = resp;
    const filePath = path.resolve(__dirname, '../', 'files', 'largeFiles', 'file', fileInfo.fileId + path.extname(fileName));
    const fileChunkPath = path.resolve(__dirname, '../', 'files', 'largeFiles', 'fileStream');
    // 整体文件是否存在
    const isFileExist = await isFileExists(filePath);
    const needUploadedHash = [];
    for(const hashChunk of allFileChunks) {
        const chunkPath = path.resolve(fileChunkPath, hashChunk);
        const isChunkExist = await isFileExists(chunkPath);
        if(!isChunkExist) {
            needUploadedHash.push(hashChunk);
            hasUploadedHash = hasUploadedHash.filter(it => it !== hashChunk);
            continue;
        }
        const res = await getFileChunkMD5Info(chunkPath);
        if(res !== true) {
            needUploadedHash.push(res);
            hasUploadedHash = hasUploadedHash.filter(it => it !== res);
        }
    }
    if(needUploadedHash.length === 0) return true;
    fileInfo.needUploadedHash = needUploadedHash;
    fileInfo.hasUploadedHash = hasUploadedHash;
    fileInfo = JSON.stringify(fileInfo);
    const res = await largeFileModel.update({ fileUploadInfo: fileInfo }, { where: { id: ~~id } });
    if(res && res[0] !== 0) {
        return false;
    }
}
