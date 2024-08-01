const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const { returnFormat } = require("../utils/format");

const upload = (filePath, limit = 1024 * 1024 * 2, allowExt = null) => {
    return multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                // 存储在指定位置
                cb(null, filePath);
            },
            filename: function (req, file, cb) {
                const uniqueName = Date.now() + "-" + req.query?.id;
                const extName = path.extname(file.originalname);
                cb(null, uniqueName + extName);
            },
        }),
        limits: {
            fileSize: limit, // 限制大小
        },
        // 判断后缀名是否正确
        fileFilter: function (req, file, cb) {
            if (!allowExt) {
                cb(null, true);
                return;
            }
            const fileExt = path.extname(file.originalname);
            if (allowExt.includes(fileExt)) {
                // 正确的处理
                cb(null, true);
            } else {
                cb(new Error("please choose a picture!")); // 后缀名错误则抛出错误，等待后面的中间件捕获
            }
        },
    })
}

const imageExt = [".jpg",".tiff",".gif",".svg",".jfif",".webp",".png",".bmp"]
const normalFilePath = path.resolve(__dirname, "../files/normalFiles")

router.post("/single/image", upload(normalFilePath, 1024 * 1024 * 2, imageExt).single("image"), (req, res) => {
    res.send(returnFormat(200, req.image.filename, "上传成功！"));
});

module.exports = router;