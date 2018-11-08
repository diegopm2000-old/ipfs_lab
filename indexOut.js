// index.js

const fs = require('fs');
const log = require('./log.helper');
const ipfsHelper = require('./ipfs.helper');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS
// //////////////////////////////////////////////////////////////////////////////

const moduleName = '[Index]';

// //////////////////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function memoryUsageTrace(nameFunction) {
  const used = process.memoryUsage();
  log.debug(`${moduleName}:${nameFunction} (MEM) --> ${JSON.stringify(used)}`);
}

function initIPFS() {
  const options = {
    host: process.env.IPFS_HOST,
    port: process.env.IPFS_PORT,
    protocol: process.env.IPFS_PROTOCOL,
  };

  log.debug(`${moduleName}:${initIPFS.name} (IN) --> options: ${JSON.stringify(options)}`);
  ipfsHelper.init(options);

  log.debug(`${moduleName}:${initIPFS.name} (OUT) --> IPFS Helper initialized OK!`);
}

async function loadFileFromFileSystem(filepath) {
  return new Promise((resolve, reject) => {
    try {
      log.debug(`${moduleName}:${loadFileFromFileSystem.name} (IN) --> filepath: ${filepath}`);
      const file = fs.readFileSync(filepath);
      log.debug(`${moduleName}:${loadFileFromFileSystem.name} (MID) --> file loaded with length: ${file.length / 100} (KBytes)`);
      memoryUsageTrace(loadFileFromFileSystem.name);
      log.debug(`${moduleName}:${loadFileFromFileSystem.name} (OUT) --> file: <<file>>`);
      resolve(file);
    } catch (error) {
      log.error(`${moduleName}:${loadFileFromFileSystem.name} (ERROR) --> error: ${error.message}`);
      reject(error);
    }
  });
}

async function saveFileToFileSystem(filename, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, data, (err) => {
      if (err) {
        log.error(`${moduleName}:${saveFileToFileSystem.name} (ERROR) --> error: ${error.message}`);
        reject(err);
      }
    });
  });
}

function start() {
  // 1. Init IPFS Helper
  initIPFS();
  // 2. Prepare origin file and name of destination file
  const originFile = 'index.js';
  const destinationFile = 'indexOut.js';
  // 3. Load File from filesystem
  loadFileFromFileSystem(originFile)
    .then(result => ipfsHelper.saveFile(result))
    .then(result => ipfsHelper.loadFile(result))
    .then(result => saveFileToFileSystem(destinationFile, result))
    .then(() => log.debug('All operations completed with Success'))
    .catch((error) => {
      log.error(`${moduleName}:${start.name} (ERROR) --> ${error.stack}`);
    });
}

// //////////////////////////////////////////////////////////////////////////////
// INIT
// //////////////////////////////////////////////////////////////////////////////

start();

