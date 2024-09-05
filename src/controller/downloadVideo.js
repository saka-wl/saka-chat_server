const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { getFileSize } = require("../utils/file");
const { returnFormat } = require("../utils/format");

router.get("/video/:filename", (req, res) => {
    const filename = path.resolve(__dirname, '../files/largeFiles/file', 'ffmpeg-' + req.params.filename);
    console.log(filename);
    const extName = path.extname(filename);
    if (extName === '.mp4') {
        const stat = fs.statSync(filename);
        const range = req.headers.range
        if (!range) {
            res.download(filename, req.params.filename);
            return;
        }
        const parts = range.replace(/bytes=/, '').split('-');
        const start = Number(parts[0]);
        const end = Number(parts[1]) || stat.size - 1
        // const headers = {
        //     "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        //     "Accept-Ranges": "bytes",
        //     "Content-Length": end - start + 1,
        //     "Content-Type": "video/mp4",
        // };
        // res.writeHead(206, headers);
        fs.createReadStream(filename, {
            start,
            end
        }).pipe(res);
    } else {
        res.download(filename, req.params.filename);
    }
})

router.post("/getfilesize", async (req, res) => {
    const filename = path.resolve(__dirname, '../files/largeFiles/file', 'ffmpeg-' + req.body.filename);
    const fileSize = await getFileSize(filename);
    if(!fileSize) {
        res.send(returnFormat(200, null, '该文件不存在'));
        return;
    }
    res.send(returnFormat(200, fileSize, ''));
})


module.exports = router;