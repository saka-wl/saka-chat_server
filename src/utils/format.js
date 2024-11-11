
exports.returnFormat = (code, data = "", msg = "", authorization, shortAuthorization) => {
    const res = {
        code,
        data,
        msg
    };
    if(authorization) res.authorization = authorization;
    if(shortAuthorization) res.shortAuthorization = shortAuthorization;
    return res;
}

/**
 * 0 取obj里面与args同名的属性
 * 1 根据args删除obj里面的同名的属性
 * @param {*} obj 
 * @param {*} type 
 * @param  {...any} args 
 * @returns 
 */
exports.objFormat = (obj, type = 0, ...args) => {
    let res = {}
    for (let key in obj) {
        if (type === 0 && args.includes(key)) {
            res[key] = obj[key]
        }
        if (type === 1 && !args.includes(key)) {
            res[key] = obj[key]
        }
    }
    return res
}

exports.isObjAllow = (obj, ...args) => {
    if (!obj) return false;
    for (let key in obj) {
        if ((obj[key] === '' || obj[key] === null || obj[key] === undefined) && args.includes(key)) {
            return false;
        }
    }
    return true;
}

exports.isValueNull = (val) => {
    return val === null || val === undefined || val === '';
}

exports.deleteObjNullKeys = (obj) => {
    return Object.keys(obj).reduce((acc, key) => {
        if(obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
            acc[key] = obj[key];
        }
        return acc;
    }, {});
}