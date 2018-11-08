// index.js

const fs = require('fs');
const path = require('path');
const log = require('./log.helper');
const memHelper = require('./mem.helper');
const ipfsHelper = require('./ipfs.helper');
const fileType = require('file-type');

const File = require('./file.entity');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS
// //////////////////////////////////////////////////////////////////////////////

const moduleName = '[Index]';

// //////////////////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

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
      const data = fs.readFileSync(filepath);
      log.debug(`${moduleName}:${loadFileFromFileSystem.name} (MID) --> file loaded with length: ${data.length / 100} (KBytes)`);
      memHelper.memoryUsageTrace(moduleName, loadFileFromFileSystem.name);

      const fileProperties = {
        data,
        name: path.basename(filepath),
        type: fileType(data),
      };

      const fileLoaded = new File(fileProperties);

      log.debug(`${moduleName}:${loadFileFromFileSystem.name} (OUT) --> data: <<data>>, name: ${fileLoaded.name}, type: ${JSON.stringify(fileLoaded.type)}`);
      resolve(fileLoaded);
    } catch (error) {
      log.error(`${moduleName}:${loadFileFromFileSystem.name} (ERROR) --> error: ${error.message}`);
      reject(error);
    }
  });
}

async function saveFileToFileSystem(folderOUT, file) {
  return new Promise((resolve, reject) => {
    log.debug(`${moduleName}:${saveFileToFileSystem.name} (IN) --> filename: ${file.name}, data: <<data>>, length: ${file.data.length / 1000} KBytes`);

    const fileOutPathFile = `${folderOUT}/${file.name}`;

    fs.writeFile(fileOutPathFile, file.data, (err) => {
      if (err) {
        log.error(`${moduleName}:${saveFileToFileSystem.name} (ERROR) --> error: ${err.message}`);
        reject(err);
      }
      log.debug(`${moduleName}:${saveFileToFileSystem.name} (OUT) --> file saved OK!`);
      resolve(true);
    });
  });
}

function start() {
  // 1. Init IPFS Helper
  initIPFS();
  const folderIN = '../files/filesIN';
  const folderOUT = '../files/filesOUT';
  const testFiles = [
    { originFile: 'index.js' },
    { originFile: 'test.img' },
    { originFile: 'test10.img' },
    { originFile: 'test100.img' },
    { originFile: 'test200.img' },

    { originFile: 'test1000.img' },
    { originFile: 'CleanArchitecture.pdf' },
    { originFile: 'ubuntu-18.04.1-desktop-amd64.iso' },
  ];
  const index = 7;
  // 2. Prepare origin file and name of destination file
  const originpathFile = `${folderIN}/${testFiles[index].originFile}`;
  // 3. Load File from filesystem
  loadFileFromFileSystem(originpathFile)
    .then(result => ipfsHelper.saveFile(result))
    .then(result => ipfsHelper.loadFile(result))
    .then(result => saveFileToFileSystem(folderOUT, result))
    .then(() => log.debug('All operations completed with Success'))
    .catch((error) => {
      log.error(`${moduleName}:${start.name} (ERROR) --> ${error.stack}`);
    });
}

// //////////////////////////////////////////////////////////////////////////////
// INIT
// //////////////////////////////////////////////////////////////////////////////

start();

