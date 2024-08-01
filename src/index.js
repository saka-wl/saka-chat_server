const express = require("express");
const cookieParser = require("cookie-parser");
const NodeCache = require("node-cache");
const { returnFormat } = require("./utils/format");

require("dotenv").config();
require("./db/init");

const app = express();
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require("./utils/cors"));

/**
 * /c 无鉴权c端接口
 * /superc 有鉴权c端接口
 */
app.use("/api/c/user", require("./controller/userController"));
app.use("/api/c/captcha", require("./controller/captcha"));

/**
 * 工具api
 */
app.use("/common/uploadNormalFile", require("./controller/uploadNormalFile"));

/**
 * 错误捕获中间件
 */
app.use(function (err, req, res, next) {
    if (err instanceof ServiceError) {
        res.send(returnFormat(500, undefined, err.toResponseJSON()));
    } else {
        res.send(returnFormat(500, undefined, new UnknownError().toResponseJSON()));
    }
});

const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => {
    console.log("Server is listenning in http://localhost:" + port);
});

/**
 * 存储session
 */
exports.globalSessionInfo = new NodeCache({ stdTTL: process.env.CAPTCHA_TIMELINE, checkperiod: process.env.CAPTCHA_SESSION_CLEAR_TIME })
