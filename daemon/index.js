#!/usr/bin/env node

const path = require('path')
const os = require('os')
const {EventEmitter} = require('events')
const _ = require('lodash')
const modules = require('./modules')

class Heartbeat extends EventEmitter {
  constructor(interval = 10000, factor = 2) {
    super()
    this.interval = 10000
    this.factor = factor
    this.lastTime = new Date()
    setInterval(this.tick.bind(this), this.interval)
  }

  tick() {
    const {lastTime} = this
    const now = new Date()
    this.lastTime = now

    const duration = now - lastTime

    this.emit('tick', duration, lastTime, now)

    if (duration > this.interval * this.factor) {
      this.emit('exceed', duration, lastTime, now)
    }
  }
}

class StatusDaemon extends EventEmitter {
  constructor(configFile) {
    super()
    this.running = false
    this.currentStatus = null
    this.config = require(configFile)
    this.app = require('./server')(this)
    this.modules = _.mapValues(this.config.modules, (x, key) => modules[key](this))
    this.heartbeat = new Heartbeat()
    this.heartbeat.on('exceed', this.exceedHeartbeat.bind(this))
  }

  exceedHeartbeat(duration, lastTime, now) {
    const status = this.currentStatus
    if (status === 'off') {
      console.log(`Exceeded heartbeat, but was "off" anyway.`)
    } else {
      console.log(
        `Exceeded heartbeat, duration was ${duration} after ${lastTime} "${status}", setting to "off" until ${now}`
      )
      this.emit('statusWithTime', 'off', lastTime)
      this.set(status)
    }
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

    const port = this.getConfig('port', Number(process.env.PORT || 8181))
    this.app.listen(port)
    this.running = true
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
