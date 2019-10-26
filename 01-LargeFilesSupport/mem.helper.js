
const log = require('./log.helper');

function memoryUsageTrace(moduleName, nameFunction) {
  const used = process.memoryUsage();
  log.debug(`${moduleName}:${nameFunction} (MEM) --> ${JSON.stringify(used)}`);
}

module.exports = {
  memoryUsageTrace,
};
