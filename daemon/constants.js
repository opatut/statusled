// const ALL_STATUSES = ['off', 'red', 'yellow', 'green', 'blue', 'party', 'police', 'random']

const SLACK_ICONS = {
  off: '',
  red: ':red_circle:',
  yellow: ':large_orange_diamond:',
  green: ':heavy_check_mark:',
  blue: ':double_vertical_bar:',
  party: ':parrot:',
  police: '',
  random: '',
}

const MESSAGES = {
  off: '',
  red: 'Do not disturb',
  yellow: 'Tell me if you need me',
  green: "I'm feeling chatty",
  blue: 'On a break',
  party: "Let's party",
  police: '',
  random: '',
}

const LED_STATES = {
  off: 0,
  red: 1,
  yellow: 2,
  green: 3,
  blue: 4,
  party: 5,
  police: 6,
  random: 7,
}

module.exports = {
  LED_STATES,
  SLACK_ICONS,
  MESSAGES,
}
