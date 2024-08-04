
exports.returnFormat = (code, data = "", msg = "", authorization) => {
    return {
        code,
        data,
        msg,
        authorization
    }
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
        if(type === 1 && !args.includes(key)) {
            res[key] = obj[key]
        }
    }
    return res
}