const path = require("path");
const fs = require('fs');

const fileChunkPath = path.join(__dirname, "../files/largeFiles/fileStream");
const filePath = path.join(__dirname, "../files/largeFiles/file");

/**
 * 异步查看文件是否存在
 * @param {*} path
 * @returns
 */
async function isFileExists(path) {
    try {
        await fs.promises.stat(path);
        return true;
    } catch {
        return false;
    }
}

/**
 * 合并文件切片
 * 文件切片hash是反的！
 * @param {*} fileChunkHashs 
 */
exports.combineFile = async (fileChunkHashs, fileId, fileName) => {
    const target = path.resolve(filePath, fileId + '-' + fileName);
    async function _addChunk(chunkId) {
        const chunkPath = path.join(fileChunkPath, chunkId);
        // 获取分片信息
        const buffer = await fs.promises.readFile(chunkPath);
        await fs.promises.appendFile(target, buffer);
    }
    for (const chunkId of fileChunkHashs) {
        await _addChunk(chunkId);
    }
    return target
};
