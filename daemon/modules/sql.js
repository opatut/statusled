const Knex = require('knex')
const path = require('path')
const {wrapRetry} = require('../utils')

module.exports = options => {
  const {filename = 'log.db'} = options.modules.sql || {}
  const filepath = path.resolve(options.rootDir, filename);

  const knex = Knex({
    client: 'sqlite3',
    connection: {filename: filepath},
  })

  let unwrittenSqlLog = []

  const writeSqlLog = wrapRetry(async () => {
    const hasTable = await knex.schema.hasTable('statuses')
    if (!hasTable) {
      await knex.schema.createTable('statuses', function(t) {
        t.increments('id').primary()
        t.string('status')
        t.dateTime('date')
      })
      console.log('database created')
    }

    while (unwrittenSqlLog.length) {
      const item = unwrittenSqlLog[0]
      await knex.insert(item).into('statuses')
      unwrittenSqlLog.shift()
      console.log('written sql item', item)
    }
  }, 10000)

  return status => {
    unwrittenSqlLog.push({status, date: new Date()})
    writeSqlLog()
  }
}