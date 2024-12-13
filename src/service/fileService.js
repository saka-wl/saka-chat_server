
const { Op } = require("sequelize")
const { objFormat, returnFormat, isValueNull, deleteObjNullKeys } = require("../utils/format")
const largeFileModel = require("../model/largeFileModel")
const path = require("path");
const sparkmd5 = require('../utils/sparkMd5');
const fs = require('fs');

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

    let resp = await largeFileModel.findAll({ where: { ownUserId: ownUserId, status: { [Op.or]: [-1, 0, 1] } } });
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

const getFileChunkMD5Info = async (filePath, checkedHash) => {
    return new Promise((res, rej) => {
        const spark = new sparkmd5.ArrayBuffer();
        fs.readFile(filePath, (err, data) => {
            const buffer = new Uint8Array(data).buffer;
            spark.append(buffer);
            const hash = spark.end();
            if(hash === checkedHash) {
                res(true);
            }else{
                res(checkedHash);
            }
        })
    })
}

/**
 * 210 - 文件校验正常
 * 311 - 文件校验发现切片存在缺失，数据库文件信息矫正成功 携带fileInfo
 * 411 - 该文件信息在数据库中不存在
 * @param {*} id 
 * @returns 
 */
exports.checkFileChunks = async (id) => {
    const resp = (await largeFileModel.findOne({ where: { id: ~~id } }))?.dataValues;
    if (!resp) return { code: 411 };
    let fileInfo = JSON.parse(resp.fileUploadInfo);
    const { hasUploadedHash, needUploadedHash } = fileInfo;
    let hasUploadedHashChecked = [...hasUploadedHash];
    let needUploadedHashChecked = [...needUploadedHash];
    const fileChunkPath = path.resolve(__dirname, '../', 'files', 'largeFiles', 'fileStream');
    for (const hashChunk of hasUploadedHash) {
        const chunkPath = path.resolve(fileChunkPath, hashChunk);
        if (!fs.existsSync(chunkPath)) {
            needUploadedHashChecked.push(hashChunk);
            hasUploadedHashChecked = hasUploadedHashChecked.filter(it => it !== hashChunk);
            continue;
        }
        const res = await getFileChunkMD5Info(chunkPath, hashChunk);
        if (res !== true) {
            needUploadedHashChecked.push(res);
            hasUploadedHashChecked = hasUploadedHashChecked.filter(it => it !== res);
        }
    }
    if (needUploadedHashChecked.join('') === needUploadedHash.join('')) return { code: 210 };
    fileInfo.needUploadedHash = needUploadedHashChecked;
    fileInfo.hasUploadedHash = hasUploadedHashChecked;
    await largeFileModel.update({ fileUploadInfo: JSON.stringify(fileInfo) }, { where: { id: ~~id, fileId: fileInfo.fileId } });
    return { code: 311, fileInfo };
}
