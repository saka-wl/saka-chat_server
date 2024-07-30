const sequelize = require("./db")
const userModel = require("../model/userModel")

async function init() {
    await sequelize.sync({
        alter: true
    })
    console.log("数据库初始化完毕！")
}

init()