const express = require('express');
const { editNewFileInfo } = require('../service/uploadFileService');
const router = express.Router();
const multer = require("multer");
const path = require("path");

const upload = (filePath, limit = 1024 * 1024 * 1024 * 5, allowExt = null) => {
    return multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                // 存储在指定位置
                cb(null, filePath + '/' + req.query.fileId);
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname);
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

/**
 * 1. 大文件存储的名字：文件整体的md5 + ‘-’ + 文件名 + 后缀名
 * 2. 视频正常处理，不以流的形式播放
 * 3. 文件密码 md5 加密
 */

/**
 * 添加大文件md5分片信息
 */
router.post('/editNewFileInfo', async (req, res) => {
    const resp = await editNewFileInfo(req.body);
    res.send(resp);
});

const largeFilePath = path.resolve(__dirname, "../files/largeFiles/fileStream");
/**
 * 上传文件分片
 * file 文件内容
 * chunkHash 文件分片md5
 * fileId 文件整体id
 */
router.post('/uploadFileChunk', upload(largeFilePath).single("file"), async (req, res) => {
    const resp = await addFileChunk(req.body);
    res.send(resp);
});

module.exports = router;