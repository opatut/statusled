const path = require('path')
const fs = require('fs')
const os = require('os')
const {wrapRetry} = require('../utils')

module.exports = options => {
  const {filename = 'status'} = options.modules.file || {}
  const filepath = path.resolve(options.rootDir, filename);

  return wrapRetry(status => {
    fs.writeFileSync(filepath, status + '\n')
    console.log(`wrote ${status} to ${filepath}`)
  }, 10000)
}
