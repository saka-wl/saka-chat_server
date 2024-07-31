const express = require("express");
const cookieParser = require("cookie-parser");
const { clearSessionMap } = require("./utils/session");

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

clearSessionMap(~~process.env.CAPTCHA_SESSION_CLEAR_TIME || 10000)

const port = process.env.SERVER_PORT || 3000;
app.listen(port, () => {
    console.log("Server is listenning in http://localhost:" + port);
});