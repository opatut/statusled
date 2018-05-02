#!/usr/bin/env node

const setters = [require('./slack'), require('./serial'), require('./sql')]

let lastStatus
const set = (module.exports.set = async status => {
  lastStatus = status
  await Promise.all(setters.map(s => s(status)))
  return status
})
set('off')

require('./server')
