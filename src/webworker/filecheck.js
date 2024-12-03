const { parentPort } = require("worker_threads");
const { checkFileChunks } = require("../service/fileService");

parentPort.on('message', async (fileId) => {
    const resp = await checkFileChunks(fileId);
    parentPort.postMessage(resp);
})
