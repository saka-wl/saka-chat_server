const path = require("path");
const fs = require('fs');
const { exec } = require("child_process");
const {
    Worker
} = require('worker_threads');
const { returnFormat } = require("./format");

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

exports.createTargetFiles = async () => {
    const files = [
        path.resolve(__dirname, '../files/largeFiles'),
        path.resolve(__dirname, '../files/normalFiles'),
        path.resolve(__dirname, '../files/largeFiles/file'),
        path.resolve(__dirname, '../files/largeFiles/fileStream'),
        path.resolve(__dirname, '../files/normalFiles/Files'),
        path.resolve(__dirname, '../files/normalFiles/Images'),
    ]
    try {
        for (let item of files) {
            const isExist = await isFileExists(item);
            if (isExist) continue;
            fs.mkdir(item, (err) => { console.log(err); });
        }
    } catch (err) {
        console.log(err);
    }
}

exports.clearTargetFiles = async () => {
    const files = [
        path.resolve(__dirname, '../files/largeFiles/file'),
        path.resolve(__dirname, '../files/largeFiles/fileStream'),
        path.resolve(__dirname, '../files/normalFiles/Files'),
        path.resolve(__dirname, '../files/normalFiles/Images'),
    ]
    try {
        for (let item of files) {
            const isExist = await isFileExists(item);
            if (!isExist) continue;
            clearDir(item);
        }
    } catch (err) {
        console.log(err);
    }
}


const clearDir = (path) => {
    const files = fs.readdirSync(path);
    files.forEach(file => {
        const filePath = `${path}/${file}`;
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            clearDir(filePath);
        } else {
            fs.unlinkSync(filePath);
        }
    })
};

function transformFfmpeg(sourceFile, outputStream) {
    exec(`mp4fragment ${sourceFile} ${outputStream}`);
    // ffmpeg 无法处理
    // exec(`ffmpeg -i ${sourceFile} -movflags frag_keyframe+empty_moov ${outputStream}`);
}

/**
 * 验证资源完整性
 * @param {*} id 
 * @returns 
 */
exports.totalFileCheck = (id) => {
    return new Promise(async (resolve, rej) => {
        const worker = new Worker(path.resolve(__dirname, '../webworker', 'filecheck.js'));
        worker.postMessage(id);
        worker.on('message', ({ code, fileInfo = null }) => {
            if (code === 210) resolve(true);
            else if (code === 311) resolve({ code: 400, fileInfo, msg: '文件出现问题，请重新上传' });
            else if (code === 411) resolve({ code: 400, fileInfo, msg: '服务器问题，请重新上传' });
        });
        worker.on('error', (err) => {
            console.log(err);
            resolve({ code: 400, fileInfo: null, msg: '服务器问题，请重新上传' });
        })
    });
}

/**
 * 合并文件切片
 * 1. 校验所有的文件切片
 * 2. 文件合并
 * @param {*} fileChunkHashs 
 */
exports.combineFile = async (fileChunkHashs, fileId, fileName, id) => {
    // 验证资源完整性
    const fileCheckResp = await exports.totalFileCheck(id);
    if (fileCheckResp !== true) return fileCheckResp;
    // 文件合并
    const target = path.resolve(filePath, fileId + path.extname(fileName));
    if (await isFileExists(target)) return { code: 200, fileInfo: target, msg: '文件合并成功！' };
    async function _addChunk(chunkId) {
        const chunkPath = path.join(fileChunkPath, chunkId);
        // 获取分片信息
        const buffer = await fs.promises.readFile(chunkPath);
        await fs.promises.appendFile(target, buffer);
    }
    for (const chunkId of fileChunkHashs) {
        await _addChunk(chunkId);
    }

    if (fileName.endsWith('.mp4')) {
        transformFfmpeg(target, path.resolve(filePath, 'ffmpeg-' + fileId + path.extname(fileName)));
    }
    return { code: 200, fileInfo: target, msg: '文件合并成功！' };
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
