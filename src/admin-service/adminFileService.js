const { isValueNull } = require("../utils/format");

const largeFileModel = require("../model/largeFileModel")

exports.getFilesByCondition = async (data) => {
    if(isValueNull(data?.page)) data.page = 0;
    if(isValueNull(data?.limit)) data.limit = 10;
    return await largeFileModel.findAndCountAll({
        where: { ...data },
        offset: data.page * data.limit,
        limit: data.limit
    })
}