const SLACK_ICONS = {
  off: '',
  red: ':red:',
  yellow: ':yellow:',
  green: ':green:',
  break: ':break:',
  party: ':parrot:',
  police: '',
  random: '',
  meeting: ':meeting:',
  phone: ':meeting-phone:',
};

const MESSAGES = {
  off: '',
  red: 'Do not disturb',
  yellow: 'Working',
  green: 'Available',
  break: 'On a break',
  party: "Let's party",
  police: '',
  random: '',
  meeting: 'In a meeting',
  phone: 'In a call',
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
  phone: 8,
};

module.exports = {
  LED_STATES,
  SLACK_ICONS,
  MESSAGES,
};
