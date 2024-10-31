
const AdminUserModel = require("../admin-model/adminUserModel")
const md5 = require('md5');
const { returnFormat, objFormat } = require("../utils/format");
const { encipherAdminJWT } = require("../utils/jwt");
const { Op } = require("sequelize");

exports.login = async (account, password) => {
    const md5Password = md5(password);
    const resp = await AdminUserModel.findOne({
        where: {
            account,
            password: md5Password
        }
    })
    if(resp?.dataValues?.id) {
        let token = encipherAdminJWT({
            id: resp.dataValues.id,
            account: resp.dataValues.account
        })
        resp.dataValues.password = "***"
        return returnFormat(200, resp.dataValues, "登录成功！", token)
    }else{
        return returnFormat(404, undefined, "账号或密码错误！")
    }
}

exports.autoLogin = async (account, id) => {
    const resp = await AdminUserModel.findOne({
        where: {
            account,
            id
        }
    })
    if(resp?.dataValues?.id) {
        resp.dataValues.password = "***"
        return returnFormat(200, resp.dataValues, "登录成功！")
    }else{
        return returnFormat(404, undefined, "请重新登录！")
    }
}

exports.enroll = async (account, password, nickname, phone, avatar, levelPwd = '') => {
    const md5Password = md5(password);
    try {
        let resp = await AdminUserModel.findOne({
            where: {
                account
            }
        })
        if(resp?.dataValues) {
            return returnFormat(409, undefined, "账号已存在！")
        }
        let level = 1;
        if(levelPwd === process.env.ADMIN_LEVEL_APPLY_SECRET) level = 2;
        resp = await AdminUserModel.create({
            account,
            password: md5Password,
            nickname,
            email,
            avatar,
            level
        })
        let token = encipherAdminJWT({
            id: resp.dataValues.id,
            account: account
        })
        return returnFormat(200, resp.dataValues.id, "注册成功！", token)
    }catch(err) {
        console.log(err)
        return returnFormat(500, undefined, "服务器错误！")
    }
}

exports.changeUserInfo = async (data) => {
    const account = data.account;
    const id = data.id;
    const originPassword = data.originPassword;
    data = objFormat(data, 0, 'phone', 'nickname', 'avatar', 'password');
    let whereObj = {
        account,
        id: ~~id
    }
    if(originPassword && data.password) {
        whereObj.password = md5(originPassword);
        data.password = md5(data.password);
    }else{
        delete data.password;
    }
    let resp = await AdminUserModel.findOne({ where: whereObj });
    if(!resp) {
        return returnFormat(200, null, '原密码错误！');
    }
    await AdminUserModel.update(data, {
        where: whereObj
    });
    resp = objFormat({
        ... resp.dataValues,
        ... data
    }, 1, 'password', 'createdAt', 'updatedAt', 'deletedAt');

    return returnFormat(200, resp, '修改成功！');
}