// ipfs.helper.js

const ipfsAPI = require('ipfs-api');
const log = require('./log.helper');
const memHelper = require('./mem.helper');

const Filemetadata = require('./filemetadata.entity');
const File = require('./file.entity');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS
// //////////////////////////////////////////////////////////////////////////////

const moduleName = '[IPFS Helper]';

// //////////////////////////////////////////////////////////////////////////////
// PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

// IPFS Connection Service
let ipfs;
// IPFS configuration
let ipfsConfig;

// //////////////////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function saveDataToIPFS(data) {
  log.info(`${moduleName}:${saveDataToIPFS.name} (IN) --> data: <<data>>, length: ${data.length / 1000} KBytes`);

  const resultData = await ipfs.files.add(data);
  const ipfshash = (resultData[0].hash);

  log.info(`${moduleName}:${saveDataToIPFS.name} (OUT) --> ipfshash:${ipfshash}`);
  return ipfshash;
}

async function loadDataFromIPFS(ipfshash) {
  log.debug(`${moduleName}:${loadDataFromIPFS.name} (IN) --> ipfshash: ${ipfshash}`);

  const files = await ipfs.files.get(ipfshash);
  let contentFile;
  files.forEach((file) => {
    contentFile = file.content;
  });
  log.debug(`${moduleName}:${saveDataToIPFS.name} (OUT) --> contentFile: <<contentFile>>`);
  return contentFile;
}

function buildFileMetaData(file, ipfshashData) {
  log.debug(`${moduleName}:${buildFileMetaData.name} (IN) --> file.name: ${file.name}, file.type: ${file.type}, ipfshashData: ${ipfshashData}`);
  const metaOptions = {
    name: file.name,
    type: file.type,
    ipfshash: ipfshashData,
  };
  const filemetadata = new Filemetadata(metaOptions);
  log.debug(`${moduleName}:${buildFileMetaData.name} (OUT) --> filemetadata: ${JSON.stringify(filemetadata)}`);
  return filemetadata;
}

function buildFile(data, name, type) {
  log.debug(`${moduleName}:${buildFile.name} (IN) --> data: <<data>>, name: ${name}, type: ${type}`);
  const fileLoaded = new File({ data, name, type });
  log.debug(`${moduleName}:${buildFile.name} (OUT) --> file.data: <<data>>, file.name: ${fileLoaded.name}, file.type: ${JSON.stringify(fileLoaded.type)}`);
  return fileLoaded;
}

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function init({ host, port, protocol }) {
  log.info(`${moduleName}:${init.name} (IN) --> host: ${host}, port: ${port}, protocol: ${host}`);
  ipfsConfig = { host, port, protocol };
  ipfs = ipfsAPI(ipfsConfig);
  log.info(`${moduleName}:${init.name} (OUT) --> IPFS Connection Service initiallized OK!`);
}

async function saveFile(file) {
  log.info(`${moduleName}:${saveFile.name} (IN) --> file.name: ${file.name}, file.type: ${file.type}, file.data: <<data>>`);
  // 1. First save file data
  const ipfshashData = await saveDataToIPFS(file.data);
  // 2. Build file metadata
  const filemetadata = buildFileMetaData(file, ipfshashData);
  // 3. Save file metadata
  const ipfshashMetaData = await saveDataToIPFS(Buffer.from(JSON.stringify(filemetadata)));
  // 4. Return ipfs hash metadata as result
  log.info(`${moduleName}:${saveFile.name} (OUT) --> ipfsHashMetaData: ${ipfshashMetaData}`);
  memHelper.memoryUsageTrace(moduleName, saveFile.name);
  return ipfshashMetaData;
}

async function loadFile(ipfshash) {
  log.info(`${moduleName}:${loadFile.name} (IN) --> ipfsHash: ${ipfshash}`);
  // 1. First load file metadata
  const buffermetadata = await loadDataFromIPFS(ipfshash);
  // 2. Parse file metadata
  const objmetadata = JSON.parse(buffermetadata);
  // 3. Load file data
  const bufferdata = await loadDataFromIPFS(objmetadata.ipfshash);
  // 4. Build file
  const fileLoaded = buildFile(bufferdata, objmetadata.name, objmetadata.type);
  // 5. Return file result
  log.info(`${moduleName}:${loadFile.name} (OUT) --> file.data: <<data>>, file.name: ${fileLoaded.name}, file.type: ${JSON.stringify(fileLoaded.type)}`);
  memHelper.memoryUsageTrace(moduleName, loadFile.name);
  return fileLoaded;
}

module.exports = {
  init,
  saveFile,
  loadFile,
};

