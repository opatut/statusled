// const ALL_STATUSES = ['off', 'red', 'yellow', 'green', 'break', 'party', 'police', 'random', 'meeting']

const SLACK_ICONS = {
  off: '',
  red: ':red_circle:',
  yellow: ':large_orange_diamond:',
  green: ':heavy_check_mark:',
  break: ':double_vertical_bar:',
  party: ':parrot:',
  police: '',
  random: '',
  meeting: ':spiral_calendar_pad:',
};

const MESSAGES = {
  off: '',
  red: 'Do not disturb',
  yellow: 'Tell me if you need me',
  green: "I'm feeling chatty",
  break: 'On a break',
  party: "Let's party",
  police: '',
  random: '',
  meeting: 'In a meeting',
};

const LED_STATES = {
  off: 0,
  red: 1,
  yellow: 2,
  green: 3,
  break: 4,
  party: 5,
  police: 6,
  random: 7,
  meeting: 8,
};

module.exports = {
  LED_STATES,
  SLACK_ICONS,
  MESSAGES,
};
