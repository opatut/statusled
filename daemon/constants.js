const ALL_STATUSES = ['off', 'red', 'yellow', 'green', 'party']

const SLACK_ICONS = {
  off: '',
  red: ':red_circle:',
  yellow: ':large_orange_diamond:',
  green: ':heavy_check_mark:',
  party: ':parrot:',
}

const MESSAGES = {
  red: 'Do not disturb',
  yellow: 'Tell me if you need me',
  green: "I'm feeling chatty",
  party: "Let's party",
}

module.exports = {
  ALL_STATUSES,
  SLACK_ICONS,
  MESSAGES,
}
