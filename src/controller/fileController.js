const express = require('express')
const { getFilesByCondition, changeFileInfo } = require('../service/fileService');
const { returnFormat } = require('../utils/format');
const router = express.Router()

router.post('/super/getFilesByCondition', async (req, res) => {
    const resp = await getFilesByCondition(req.body.data, req.body.page, ~~req.userInfo.id);
    res.send(resp);
})

router.post('/super/changeFileInfo', async (req, res) => {
    const data = req.body.data;
    const where = req.body.where;
    if(~~where.ownUserId !== ~~req.userInfo.id) {
        res.send(returnFormat(200, null, 'Sorry，您没有权限！'))
        return;
    }
    await changeFileInfo(data, where);
    res.send(returnFormat(200, true, ''));
})

module.exports = router