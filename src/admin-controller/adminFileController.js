const express = require('express');
const { getFilesByCondition } = require('../admin-service/adminFileService');
const { objFormat } = require('../utils/format');
const router = express.Router();

router.post('/adminsuper/getFilesByCondition', async (req, res) => {
    const data = objFormat(req.body, 0, 'page', 'limit', 'fileId', 'fileName', 'id', 'ownUserId');
    const resp = await getFilesByCondition(data);
    res.send(resp);
})

module.exports = router;