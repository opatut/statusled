module.exports.wrapRetry = (fn, interval) => {
  let timeout
  const fn2 = async (...args) => {
    if (timeout) clearTimeout(timeout)

    try {
      const r = await fn(...args)
      timeout = null
      return r
    } catch (err) {
      console.warn(`error, retrying in ${interval}ms: `, err.message)
      timeout = setTimeout(() => fn2(...args), interval)
    }
  }
  return fn2
}

module.exports.wrap = fn => async (req, res, next) => {
  try {
    res.json(await fn(req))
  } catch (err) {
    next(err)
  }
}

module.exports.pairs = function*(arr, includeLast = false) {
  for (let i = 1; i < arr.length; i++) {
    yield [arr[i - 1], arr[i]]
  }

  if (includeLast && arr.length) {
    yield [arr[arr.length - 1], null]
  }
}

module.exports.collect = function(it) {
  return Array.from(it)
}

module.exports.map = function*(it, fn) {
  for (const i of it) {
    yield fn(i)
  }
}

module.exports.range = function*(start = 0, end, step = 1) {
  for (let i = start; step > 0 ? i < end : i > end; i += step) {
    yield i
  }
}

module.exports.mergePairs = function*(it, merge) {
  let last = undefined
  for (const i of it) {
    if (last === undefined) {
      last = i
    } else {
      const merged = merge(last, i)
      if (merged !== undefined) {
        last = merged
      } else {
        yield last
        last = i
      }
    }
  }
  yield last
}

module.exports.enumerate = function*(arr) {
  for (let i = 0; i < arr.length; i++) {
    yield [i, arr[i]]
  }
}
