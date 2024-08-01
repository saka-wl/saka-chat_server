
exports.returnFormat = (code, data = "", msg = "", authorization) => {
    return {
        code,
        data,
        msg,
        authorization
    }
}