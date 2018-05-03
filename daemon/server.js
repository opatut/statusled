const express = require('express')
const _ = require('lodash')
const moment = require('moment')
const main = require('./index')
require('moment-duration-format')(moment)

function wrap(fn) {
  return async (req, res, next) => {
    try {
      res.json(await fn(req))
    } catch (err) {
      next(err)
    }
  }
}

module.exports = daemon => {
  const app = express()

  app.get('/', (req, res) => res.send(lastStatus))

  let current
  app.post('/set/:status', async (req, res) => {
    try {
      main.set(req.params.status)
      current = req.params.status
      res.status(200).end()
    } catch (err) {
      res.status(500).send(err.stack)
    }
  })

  const port = daemon.getConfig('port', Number(process.env.PORT || 8181))
  app.set('port', port)
  return app
}
