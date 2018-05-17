const express = require('express')
const _ = require('lodash')

module.exports = daemon => {
  const app = express()

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next()
  })

  app.get('/', (req, res) => res.send(daemon.currentStatus))

  app.post('/set/:status', async (req, res) => {
    try {
      daemon.set(req.params.status)
      res.status(200).end()
    } catch (err) {
      res.status(500).send(err.stack)
    }
  })

  return app
}
