const path = require("path");
const fs = require('fs');
const { exec } = require("child_process");

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

function transformFfmpeg(sourceFile, outputStream) {
    exec(`mp4fragment ${sourceFile} ${outputStream}`);
    // ffmpeg 无法处理
    // exec(`ffmpeg -i ${sourceFile} -movflags frag_keyframe+empty_moov ${outputStream}`);
}

/**
 * 合并文件切片
 * @param {*} fileChunkHashs 
 */
exports.combineFile = async (fileChunkHashs, fileId, fileName) => {
    const target = path.resolve(filePath, fileId + path.extname(fileName));
    if(await isFileExists(target)) return target;
    async function _addChunk(chunkId) {
        const chunkPath = path.join(fileChunkPath, chunkId);
        // 获取分片信息
        const buffer = await fs.promises.readFile(chunkPath);
        await fs.promises.appendFile(target, buffer);
    }
    for (const chunkId of fileChunkHashs) {
        await _addChunk(chunkId);
    }
    if(fileName.endsWith('.mp4')) {
        transformFfmpeg(target, path.resolve(filePath, 'ffmpeg-' +fileId + path.extname(fileName)));
    }
    return target;
};

/**
 * 获取文件大小size
 * @param {*} path 
 * @returns 
 */
exports.getFileSize = async (path) => {
    try {
        const stat = await fs.promises.stat(path);
        return stat.size;
    } catch (err) {
        return null;
    }
}
