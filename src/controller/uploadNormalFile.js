const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const { returnFormat } = require("../utils/format");
const { v4: uuidv4 } = require('uuid');

const upload = (filePath, limit = 1024 * 1024 * 2, allowExt = null) => {
    return multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                // 存储在指定位置
                cb(null, filePath);
            },
            filename: function (req, file, cb) {
                const uniqueName = uuidv4();
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
                cb(new Error("please choose a allowed file!")); // 后缀名错误则抛出错误，等待后面的中间件捕获
            }
        },
    })
}

const imageExt = [".jpg",".tiff",".gif",".svg",".jfif",".webp",".png",".bmp"]
const normalImageFilePath = path.resolve(__dirname, "../files/normalFiles/Images")
router.post("/single/image", upload(normalImageFilePath, ~~process.env.NORMAL_IMAGE_FILE_LINIT_SIZE, imageExt).single("file"), (req, res) => {
    res.send(returnFormat(200, req.file.filename, "上传成功！"));
});

const fileExt = ['.mp4', '.mp3', '.zip'];
const normalFilePath = path.resolve(__dirname, "../files/normalFiles/Files")
router.post("/single/normalfile", upload(normalFilePath, ~~process.env.NORMAL_FILE_LIMIT_SIZE, fileExt).single("file"), (req, res) => {
    res.send(returnFormat(200, req.file.filename, "上传成功！"));
})

module.exports = router;