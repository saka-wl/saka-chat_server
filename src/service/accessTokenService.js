
const { Op } = require("sequelize")
const accessTokenModel = require("../admin-model/userAccessTokenModel")
const { objFormat } = require("../utils/format")

exports.getUserAccessTokenStatus = async (userId) => {
    return await accessTokenModel.findOne({ where: { userId } });
}