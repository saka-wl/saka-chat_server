
const { Op } = require("sequelize")
const { objFormat, returnFormat, isValueNull, deleteObjNullKeys } = require("../utils/format")
const largeFileModel = require("../model/largeFileModel")

exports.getFilesByCondition = async (data, page) => {
    data = objFormat(data, 0, 'id', 'fileName', 'status');
    data = deleteObjNullKeys(data);
    if(data.id) {
        let resp = await largeFileModel.findAll({ where: { id: data.id, status: 1 } });
        resp = resp.map(it => it.dataValues);
        return returnFormat(200, resp, '');
    }
    // if(!page.limit) page.limit = 7;
    // if(!page.page && page.page === 0) page.page = 0;
    // let resp = await largeFileModel.findAll({ where: { ... data }, limit: page.limit, offset: (page.page - 1) * page.limit });
    let resp = await largeFileModel.findAll({ where: {
        [Op.or]: [
            {
                fileName: {
                    [Op.like]: '%' + data.fileName + '%'
                },
                status: 1
            },
            { ... data, status: 1 }
        ]
    } });
    resp = resp.map(it => {
        it.dataValues.pwd = "***";
        return it.dataValues
    });
    return returnFormat(200, resp, '');
}

exports.getFilesFromMine = async (ownUserId, userId) => {
    if(!ownUserId) return returnFormat(200, null, '');
    if(userId != ownUserId) return returnFormat(200, null, '您无修改权限！');

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
    if(Object.keys(data).length === 0) return;
    await largeFileModel.update(data, { where });
}