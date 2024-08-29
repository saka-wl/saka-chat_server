const express = require('express');
const { editNewFileInfo } = require('../service/uploadFileService');
const { returnFormat } = require('../utils/format');
const router = express.Router();

/**
 * 1. 大文件存储的名字：文件整体的md5 + ‘-’ + 文件名 + 后缀名
 * 2. 视频正常处理，不以流的形式播放
 * 3. 文件密码 md5 加密
 */

/**
 * 添加大文件md5分片信息
 */
router.post('/editNewFileInfo', async (req, res) => {
    const resp = await editNewFileInfo(req.body.data);
    res.send(returnFormat(200, resp, resp === 0 ? '您上传了部分文件' : '初次上传改文件'));
});

router.post('/uploadFileChunk', upload, async (req, res) => {
    
})

module.exports = router;