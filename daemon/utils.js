module.exports.wrapRetry = (fn, interval) => {
  let timeout
  const fn2 = async (...args) => {
    if (timeout) clearTimeout(timeout)

    try {
      const r = await fn(...args)
      timeout = null
      return r
    } catch (err) {
      console.warn(`error, retrying in ${interval}ms`, err)
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
