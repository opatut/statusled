#!/usr/bin/env node

const [, , configFile] = process.argv
if (!configFile) {
  console.error('Usage: statusled <config-file>')
  process.exit(1)
}

const config = require(configFile)

const modules = require('./modules')

const setters = Object.keys(config.modules).map(key => modules[key](config))

let lastStatus
const set = (module.exports.set = async status => {
  lastStatus = status
  await Promise.all(setters.map(s => s(status)))
  return status
})
set('off')

require('./server')(config)
