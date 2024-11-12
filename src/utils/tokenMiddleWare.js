
const { getUserStatus } = require("../service/userService");
const { returnFormat } = require("./format")
const { verifyJWT, verifyShortJWT, encipherShortJWT } = require("./jwt")
// const { pathToRegexp } = require('path-to-regexp')

// const needTokenPath = [
//     {
//         method: "GET",
//         path: "/api/c/user/super/whoami"
//     }
// ]

module.exports = async function (req, res, next) {
    // const paths = needTokenPath.filter(item => req.method === item.method && pathToRegexp(item.path).test(req.path))
    // if (paths.length === 0) {
    //     next()
    //     return
    // }
    if (req.path.indexOf("/super/") === -1) {
        next();
        return;
    }
    let longToken = req.cookies[process.env.JWT_TOKEN_NAME];
    let shortToken = req.cookies[process.env.JWT_SHORT_TOKEN_NAME];

    // 短token存在 & 短token没问题
    const shortData = shortToken && verifyShortJWT(shortToken);
    if(shortData && shortData.id && shortData.account) {
        req.userInfo = {
            id: shortData.id,
            account: shortData.account
        };
        next();
        return;
    }

    // 短token不存在 | 过期
    // 判断长token
    let longData = longToken && verifyJWT(longToken);
    if(!longData || !longData.id || !longData.account) {
        // 长token不存在
        res.send(returnFormat(401, undefined, "您还未登录，请前往登录！"))
        return
    }
    const userTokenData = await getUserStatus(longData.id);
    // console.log(userTokenData.dataValues.status);
    if(userTokenData.dataValues.status !== 1) {
        res.send(returnFormat(401, undefined, "您的账户已被封禁，请联系管理员！"))
        return
    }
    longData = {
        id: longData?.id,
        account: longData?.account
    };
    // 长token存在
    shortToken = encipherShortJWT(longData);
    res.cookie(process.env.JWT_SHORT_TOKEN_NAME, shortToken);
    req.userInfo = longData;
    next();
}