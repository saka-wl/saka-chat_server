const express = require("express");
const cookieParser = require("cookie-parser");
const NodeCache = require("node-cache");
const { returnFormat } = require("./utils/format");
const path = require("path");
const expressWs = require("express-ws");

require("dotenv").config();
require("./db/init");

const app = express();
expressWs(app);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require("./utils/cors"));

// 鉴权判定
app.use(require('./utils/tokenMiddleWare'))

/**
 * 挂载静态资源
 */
app.use('/static/images', express.static(path.resolve(__dirname, "./files/normalFiles/Images")))

/**
 * /c 无鉴权c端接口
 * /.../super/... 有鉴权c端接口
 */
app.use("/api/c/user", require("./controller/userController"));
app.use("/api/c/captcha", require("./controller/captcha"));
app.use("/api/c/friend", require("./controller/friendController"))


/**
 * 工具api
 */
app.use("/common/uploadNormalFile", require("./controller/uploadNormalFile"));

/**
 * websocket
 */
// app.ws('/ws/friendchat')

/**
 * 错误捕获中间件
 */
app.use(function (err, req, res, next) {
    res.send(returnFormat(500, null, err?.message || "服务器错误！"));
});

const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => {
    console.log("Server is listenning in http://localhost:" + port);
});

/**
 * 存储session
 */
exports.globalSessionInfo = new NodeCache({ stdTTL: process.env.CAPTCHA_TIMELINE, checkperiod: process.env.CAPTCHA_SESSION_CLEAR_TIME })
