
const path = require('path');
const sparkmd5 = require('../utils/sparkMd5');
const fs = require('fs');

const chunkFilePath = path.resolve(__dirname, '../files/largeFiles/fileStream');

function getFileMd5(filePath) {
    const spark = new sparkmd5.ArrayBuffer();
    fs.readFile(filePath, (err, data) => {
        console.log(err)
        const buffer = new Uint8Array(data).buffer;
        // const buffer = new Blob([data]);
        spark.append(buffer);
        const hash = spark.end();
        console.log(hash);
    })
}

const testChunk01 = path.resolve(chunkFilePath, '2ecc26f97ad68cc2ba9a4b0f0268c169');
getFileMd5(testChunk01);