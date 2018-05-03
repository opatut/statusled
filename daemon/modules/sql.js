const Knex = require('knex')
const path = require('path')
const {wrap, wrapRetry} = require('../utils')

const getRows = knex => {
  const today = new Date(new Date().toISOString().split('T')[0] + ' 00:00:00').getTime()
  return knex
    .raw(
      `
        SELECT
          statuses.id AS id,
          statuses.status AS status,
          statuses.date AS date,
          end.date - statuses.date AS duration
        FROM statuses
        LEFT OUTER JOIN statuses AS end on end.id = statuses.id + 1
        WHERE statuses.date > ${today}
        ORDER BY id
      `
    )
    .map(x => (x.duration == null ? {...x, duration: new Date().getTime() - x.date} : x))
}

module.exports = daemon => {
  const filepath = daemon.getFilePath('modules.sql.filename', 'log.db')

  const knex = Knex({
    client: 'sqlite3',
    connection: {filename: filepath},
  })

  daemon.on('app', app => {
    app.get(
      '/stats',
      wrap(async req => {
        const rows = await getRows(knex)
        const durationsByStatus = _.mapValues(_.groupBy(rows, 'status'), r =>
          _.sum(_.map(r, 'duration'))
        )

        const active = _.sum(
          ['red', 'green', 'meeting', 'yellow'].map(k => durationsByStatus[k] || 0)
        )
        const total = _.sum(
          Object.keys(durationsByStatus).map(k => (k === 'off' ? 0 : durationsByStatus[k] || 0))
        )

        const stats = _.mapValues(
          {
            ...durationsByStatus,
            active,
            total,
          },
          d => moment.duration(d).format('h[h]mm[m]')
        )
        return {today: stats, current}
      })
    )
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

  daemon.on('status', status => {
    unwrittenSqlLog.push({status, date: new Date()})
    writeSqlLog()
  })
}
