const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const { returnFormat } = require("../utils/format");
const { v4: uuidv4 } = require('uuid');
const largeFileModel = require("../model/largeFileModel");

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

const uploadArr = multer({
    storage: multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, '../files/normalFiles/Images')); // 指定存储的目录  
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // 生成唯一文件名  
    }
    })
}).array("files");

const imageExt = [".jpg",".tiff",".gif",".svg",".jfif",".webp",".png",".bmp"];
const normalImageFilePath = path.resolve(__dirname, "../files/normalFiles/Images")
router.post("/single/image", upload(normalImageFilePath, ~~process.env.NORMAL_IMAGE_FILE_LINIT_SIZE, imageExt).single("file"), (req, res) => {
    res.send(returnFormat(200, req.file.filename, "上传成功！"));
});

router.post('/many/images', uploadArr, async (req, res) => {
    res.send({
        code: 200,
        data: "",
        msg: ''
    })
})

const fileExt = ['.mp4', '.mp3', '.zip'];
const normalFilePath = path.resolve(__dirname, "../files/normalFiles/Files")
router.post(
    "/single/normalfile", 
    async (req, res, next) => {
        // 如果已经上传过了
        const hash = req.query.hash;
        if(!hash) {
            res.send(returnFormat(200, undefined, "上传失败，未携带文件hash！"));
            return;
        }
        let resp = await largeFileModel.findAll({ where: { fileId: hash } });
        if(resp.length !== 0) {
            res.send(returnFormat(200, resp[0].dataValues.fileName, "上传成功！"));
            return;
        }
        next();
    }, 
    upload(normalFilePath, ~~process.env.NORMAL_FILE_LIMIT_SIZE).single("file"),
    async (req, res) => {
        await largeFileModel.create({
            fileName: req.file.filename,
            fileId: req.query.hash,
            fileType: 1,
            fileUploadInfo: JSON.stringify([]),
            ownUserId: req.query.ownUserId || '0',
        })
        res.send(returnFormat(200, req.file.filename, '上传成功！'))
    }
)

module.exports = router;