const express = require('express')
const { createMdFile, changeMdFile, getMdFileContent, getMdFilesList } = require('../service/mdFileService');
const { returnFormat } = require('../utils/format');
const router = express.Router()

// 单独写作api
/**
 * 创建新的md文档
 * ownUserId：文档归属人
 * collaborateUserIds：文档协作者
 */
router.post('/createMdFile', async (req, res) => {
    const data = req.body;
    if(!data.ownUserId || !data.collaborateUserIds || typeof data.collaborateUserIds !== 'object' || !data.fileTitle || !data.fileContent) {
        res.send(returnFormat(200, null, '参数错误'));
        return;
    }
    await createMdFile(data);
    res.send(returnFormat(200, null, '创建成功'));
});

/**
 * 修改md文档
 * id：文档id
 * content：文档内容
 */
router.post('/changeMdFile', async (req, res) => {
    const data = req.body;
    if(!data.id || !data.fileContent) {
        res.send(returnFormat(200, null, '参数错误'));
        return;
    }
    await changeMdFile(data);
    res.send(returnFormat(200, null, '修改成功'));
})

/**
 * 获取文档内容
 * id：文档id
 */
router.post('/getMdFileContent', async (req, res) => {
    const data = req.body;
    if(!data.id) {
        res.send(returnFormat(200, null, '参数错误'));
        return;
    }
    const resp = await getMdFileContent(data.id);
    res.send(returnFormat(200, resp, '获取成功！'));
})

/**
 * 获取某人的所有文档List
 * userId：用户id
 * 所属文档 + 协作文档
 */
router.post('/getMdFilesList', async (req, res) => {
    const resp = await getMdFilesList(req.body.userId);
    res.send(returnFormat(200, resp, '获取成功！'));
})

module.exports = router;