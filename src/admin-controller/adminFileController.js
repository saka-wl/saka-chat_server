const express = require('express');
const { getFilesByCondition, forbidFile, deleteFile } = require('../admin-service/adminFileService');
const { objFormat, returnFormat } = require('../utils/format');
const router = express.Router();

router.post('/adminsuper/getFilesByCondition', async (req, res) => {
    const data = objFormat(req.body, 0, 'page', 'limit', 'fileId', 'fileName', 'id', 'ownUserId');
    const resp = await getFilesByCondition(data);
    res.send(returnFormat(200, resp, '获取成功'));
})

/**
 * 1. 删除原文件
 * 2. 删除数据库中 chatMessage 和 largeFile 中的数据
 */
router.post('/adminsuper/deleteFile', async (req, res) => {
    await deleteFile(req.body.id);
    res.send(returnFormat(200, null, '删除成功！'));
})

router.post('/adminsuper/forbidFile', async (req, res) => {
    await forbidFile(req.body.id, req.body.status);
    res.send(returnFormat(200, null, '操作成功！'));
})

module.exports = router;