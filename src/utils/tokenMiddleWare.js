
const { returnFormat } = require("./format")
const { verifyJWT } = require("./jwt")
// const { pathToRegexp } = require('path-to-regexp')

// const needTokenPath = [
//     {
//         method: "GET",
//         path: "/api/c/user/super/whoami"
//     }
// ]

module.exports = function (req, res, next) {
    // const paths = needTokenPath.filter(item => req.method === item.method && pathToRegexp(item.path).test(req.path))
    // if (paths.length === 0) {
    //     next()
    //     return
    // }
    if (req.path.indexOf("/super/") === -1) {
        next()
        return
    }
    let token = req.headers['Authorization'] || req.headers['authorization']
    if (!token) {
        res.send(returnFormat(401, undefined, "您还未登录，请前往登录！"))
        return
    }
    const data = verifyJWT(token)
    if (!data || !data.id || !data.account) {
        res.send(returnFormat(401, undefined, "您还未登录，请前往登录！"))
        return
    }
    req.userInfo = {
        id: data.id,
        account: data.account
    }
    next()
}