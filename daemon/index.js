#!/usr/bin/env node

const path = require('path')
const os = require('os')
const {EventEmitter} = require('events')
const _ = require('lodash')
const modules = require('./modules')

class StatusDaemon extends EventEmitter {
  constructor(configFile) {
    super()
    this.currentStatus = null
    this.config = require(configFile)
    this.app = require('./server')(this)
    this.modules = _.mapValues(this.config.modules, (x,key) => modules[key](this))
  }

  getConfig(configPath, defaultValue) {
    return _.get(this.config, configPath, defaultValue)
  }

  getFilePath(configPath, defaultName) {
    const filename = this.getConfig(configPath, defaultName)
    const rootDir = this.getConfig('rootDir') || path.join(os.homedir(), '.statusled')
    return path.resolve(rootDir, filename)
  }

  set(status) {
    this.currentStatus = status
    if (this.running) {
      this.emit('status', status)
    }
  }

  run() {
    this.emit('app', this.app)
    this.app.listen()
    if (this.currentStatus) {
      this.emit('status', this.currentStatus)
    }
  }
}

const [, , configFile] = process.argv
if (!configFile) {
  console.error('Usage: statusled <config-file>')
  process.exit(1)
}

const daemon = new StatusDaemon(configFile)
daemon.run()
