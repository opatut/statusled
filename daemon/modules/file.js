const path = require('path')
const fs = require('fs')
const os = require('os')
const {wrapRetry} = require('../utils')

module.exports = daemon => {
  const filepath = daemon.getFilePath('modules.file.filename', 'status')

  if (fs.existsSync(filepath)) {
    const status = fs.readFileSync(filepath, 'utf-8').trim()
    if (status) {
      daemon.set(status)
    }
  }

  daemon.on(
    'status',
    wrapRetry(status => {
      fs.writeFileSync(filepath, status + '\n', 'utf-8')
      console.log(`wrote ${status} to ${filepath}`)
    }, 10000)
  )
}
