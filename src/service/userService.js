
const UserModel = require("../model/userModel")
const md5 = require('md5');
const { returnFormat } = require("../utils/format");
const { encipherJWT } = require("../utils/jwt");

exports.login = async (account, password) => {
    const md5Password = md5(password);
    const resp = await UserModel.findOne({
        where: {
            account,
            password: md5Password
        }
    })
    if(resp?.dataValues?.id) {
        let token = encipherJWT({
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
    const resp = await UserModel.findOne({
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

exports.enroll = async (account, password, nickname, phone, email, avatar) => {
    const md5Password = md5(password);
    try {
        let resp = await UserModel.findOne({
            where: {
                account
            }
        })
        if(resp?.dataValues) {
            return returnFormat(409, undefined, "账号已存在！")
        }
        resp = await UserModel.create({
            account,
            password: md5Password,
            nickname,
            phone,
            email,
            avatar
        })
        let token = encipherJWT({
            id: resp.dataValues.id,
            account: account
        })
        return returnFormat(200, resp.dataValues.id, "注册成功！", token)
    }catch(err) {
        console.log(err)
        return returnFormat(500, undefined, "服务器错误！")
    }
}

exports.searchUser = async ({
    account,
    nickname,
    id
}) => {
    let obj = {}
    if(account) obj.account = account;
    if(nickname) obj.nickname = nickname;
    if(id) obj.id = id;
    const resp = await UserModel.findAndCountAll({
        where: obj
    });

    return returnFormat(200, resp, '');
}