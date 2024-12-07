const express = require("express");
const cookieParser = require("cookie-parser");
const NodeCache = require("node-cache");
const { returnFormat } = require("./utils/format");
const path = require("path");

require("dotenv").config();
require("./db/init");
/**
 * 测试逻辑
 */
require('./test/index');

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require("./utils/cors"));

// 鉴权判定
app.use(require('./utils/tokenMiddleWare'))

/**
 * 挂载静态资源 - 普通图片资源
 */
app.use('/static/images', express.static(path.resolve(__dirname, "./files/normalFiles/Images")));
app.use('/static/largeFile', express.static(path.resolve(__dirname, "./files/largeFiles/file")));

/**
 * /c 无鉴权c端接口
 * /.../super/... 有鉴权c端接口
 */
app.use("/api/c/user", require("./controller/userController"));
app.use("/api/c/captcha", require("./controller/captcha"));
app.use("/api/c/friend", require("./controller/friendController"));
app.use("/api/c/friendchat", require("./controller/friendChatController"));
app.use("/api/c/file", require("./controller/fileController"));
app.use("/api/c/chatgroup", require("./controller/friendChatGroupController"));
app.use('/api/c/chatgroupmessage', require('./controller/friendChatGroupMessageController'));


/**
 * 工具api
 */
app.use("/common/uploadNormalFile", require("./controller/uploadNormalFile"));
app.use('/common/uploadLargeFile', require("./controller/uploadLargeFile"));
app.use('/common/download', require("./controller/downloadVideo"));

app.use(require('./utils/adminTokenMiddleWare'));

/**
 * b端
 */
// admin user接口
app.use("/admin/user", require("./admin-controller/adminUserController"));

/**
 * 错误捕获中间件
 */
app.use(function (err, req, res, next) {
    res.send(returnFormat(500, null, err?.message || "服务器错误！"));
});

const port = process.env.SERVER_PORT || 3000;
const server = app.listen(port, () => {
    console.log("Server is listenning in http://localhost:" + port);
});

/**
 * 存储session
 */
exports.globalSessionInfo = new NodeCache({ stdTTL: process.env.CAPTCHA_TIMELINE, checkperiod: process.env.CAPTCHA_SESSION_CLEAR_TIME })

/**
 * socket 挂载实时聊天
 */
const { socketApp } = require('./socket/index');
// const { checkFileChunks } = require("./service/fileService");
socketApp(server)