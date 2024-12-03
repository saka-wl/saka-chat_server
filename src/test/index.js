const path = require('path');
const {
    Worker
} = require('worker_threads');

const worker = new Worker(path.resolve(__dirname, '../webworker', 'filecheck.js'));

worker.postMessage('1');