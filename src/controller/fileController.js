const express = require('express')
const { getFilesByCondition } = require('../service/fileService')
const router = express.Router()

router.post('/super/getFilesByCondition', async (req, res) => {
    const resp = await getFilesByCondition(req.body.data, req.body.page);
    res.send(resp);
})

module.exports = router