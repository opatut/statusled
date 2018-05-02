const fetch = require('node-fetch');
const querystring = require('querystring');
const {wrapRetry} = require('./utils')

const {SLACK_ICONS, MESSAGES} = require('./constants');

async function slackFetch(fn, method, body) {
  const token = process.env.SLACK_TOKEN;
  const response = await fetch(
    'https://slack.com/api/' + fn + (method === 'get' ? '?' + querystring.stringify(body) : ''),
    {
      method,
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type':
          method === 'post' ? 'application/json' : 'application/x-www-form-urlencoded',
      },
      ...(method === 'post'
        ? {
            body: JSON.stringify(body),
          }
        : {}),
    },
  );
  const json = await response.json();
  if (!json.ok) {
    throw new Error(json.error);
  }
  return json;
}

function setSlackStatus(emoji, text) {
  return slackFetch('users.profile.set', 'post', {
    profile: {
      status_text: text,
      status_emoji: emoji,
    },
  })
}

function setSlackSnooze(num_minutes) {
  return slackFetch('dnd.setSnooze', 'get', {
    num_minutes,
  })
}

module.exports = wrapRetry(async status => {
  const icon = SLACK_ICONS[status] || ''
  const message = MESSAGES[status] || ''

  await setSlackStatus(icon, message)
  await setSlackSnooze(status == 'red' ? 30 : 0)
  console.log(`set slack status to ${icon} / ${message}`)
}, 10000)
