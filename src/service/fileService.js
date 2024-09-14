
const { Op } = require("sequelize")
const { objFormat, returnFormat, isValueNull, deleteObjNullKeys } = require("../utils/format")
const largeFileModel = require("../model/largeFileModel")

exports.getFilesByCondition = async (data, page) => {
    data = objFormat(data, 0, 'id', 'fileName', 'ownUserId', 'status');
    if(isValueNull(data.status)) data.status = 1;
    data.status = ~~data.status;
    data = deleteObjNullKeys(data);
    if(data.id) {
        let resp = await largeFileModel.findAll({ where: { id: data.id } });
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
                status: data.status
            },
            { ... data }
        ]
    } });
    resp = resp.map(it => {
        it.dataValues.pwd = "***";
        return it.dataValues
    });
    return returnFormat(200, resp, '');
}