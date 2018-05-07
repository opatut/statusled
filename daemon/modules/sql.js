const Knex = require('knex')
const path = require('path')
const {wrap, wrapRetry, collect, map, pairs, mergePairs} = require('../utils')
const _ = require('lodash')
const moment = require('moment')
require('moment-duration-format')(moment)
const DURATION_THRESHOLD = 5 * 1000 // 5 seconds

const getEntries = async (knex, from, to) => {
  const toWithNow = new Date(Math.min(new Date(), to)).getTime()
  const raw = await knex
    .select('*')
    .from('statuses')
    .where('date', '>', from)
    .where('date', '<', to)
    .orderBy('date')

  const rawBefore = await knex
    .select('*')
    .from('statuses')
    .where('date', '<', from)
    .orderBy('date', 'desc')
    .limit(1)

  const startEntry = rawBefore[0] || {date: from, status: 'off'}

  if (!raw.length || raw[0].date > from) {
    raw.unshift(startEntry)
  }

  return collect(
    mergePairs(
      map(pairs(raw, true), ([row1, row2]) => {
        const {status, date: start_} = row1
        const start = Math.max(start_, from)
        const end = row2 ? row2.date : toWithNow
        const duration = end - start
        return {status, start, end, duration}
      }),
      (left, right) =>
        (left.status === right.status || right.duration < DURATION_THRESHOLD) &&
        left.end === right.start
          ? {
              status: left.status,
              start: left.start,
              end: right.end,
              duration: right.end - left.start,
            }
          : undefined
    )
  )
}

const getStats = (rows, formatted) => {
  const durationsByStatus = _.mapValues(_.groupBy(rows, 'status'), r => _.sum(_.map(r, 'duration')))

  const allKeys = Object.keys(durationsByStatus).filter(k => k !== 'off')
  const activeKeys = ['red', 'green', 'meeting', 'yellow']

  const total = _.sum(allKeys.map(k => durationsByStatus[k] || 0))
  const active = _.sum(activeKeys.map(k => durationsByStatus[k] || 0))

  return _.mapValues(
    {
      ...durationsByStatus,
      active,
      total,
    },
    d => (formatted ? moment.duration(d).format('h[h]mm[m]') : d)
  )
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
        const from = req.query.from
          ? new Date(req.query.from)
          : moment()
              .startOf('day')
              .toDate()
              .getTime()

        const to = req.query.to
          ? new Date(req.query.to)
          : moment()
              .endOf('day')
              .toDate()
              .getTime()

        const entries = await getEntries(knex, from, to)
        const stats = getStats(entries, 'formatted' in req.query)
        return {today: stats, current: daemon.currentStatus, entries}
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

  daemon.on('statusWithTime', (status, date) => {
    unwrittenSqlLog.push({status, date})
    writeSqlLog()
  })
}
