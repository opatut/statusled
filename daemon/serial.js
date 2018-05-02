const fs = require('fs');
const shell = require('shelljs');

const {wrapRetry} = require('./utils')

const {ALL_STATUSES} = require('./constants');

module.exports = wrapRetry(async status => {
  const PORT = '/dev/ttyACM0'
  // make sure file exists
  fs.statSync(PORT)

  const stty = [
    'stty -F',
    PORT,
    '9600 -parenb -parodd cs8 -hupcl -cstopb cread clocal -crtscts',
    '-iuclc -ixany -imaxbel -iutf8 -opost -olcuc -ocrnl -onlcr -onocr -onlret -ofill -ofdel',
    'nl0 cr0 tab0 bs0 vt0 ff0 -isig -icanon -iexten -echo -echoe -echok -echonl -noflsh -xcase',
    '-tostop -echoprt -echoctl -echoke',
  ].join(' ')
  shell.exec(stty)

  const code = ALL_STATUSES.indexOf(status)
  shell.exec(`echo -en '\\x0${code}' > ${PORT}`)

  console.log('set status LED to ' + status)
}, 10000)
