const express = require('express')
const main = require('./index')

module.exports = config => {
  const app = express()

  app.get('/', (req, res) => res.send(lastStatus))
  app.post('/set/:status', async (req, res) => {
    try {
      main.set(req.params.status)
      res.status(200).end()
    } catch (err) {
      res.status(500).send(err.stack)
    }
  })

  const {port = Number(process.env.PORT || 8181)} = config
  app.listen(port)
}
