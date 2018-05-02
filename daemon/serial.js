const fs = require('fs')
const shell = require('shelljs')

const {wrapRetry} = require('./utils')

const {LED_STATES} = require('./constants')

const DEVICE_PATH = '/dev/ttyACM0'

let lastStatus

fs.watchFile(
  DEVICE_PATH,
  {
    persistent: false,
    interval: 2000,
  },
  function(stat) {
    // ino: inode number. If non-zero, the file exists, and we can write there
    if (stat.ino && lastStatus) {
      write(lastStatus)
    }
  }
)

const write = (module.exports = wrapRetry(async status => {
  lastStatus = status
  // make sure file exists
  fs.statSync(DEVICE_PATH)

  const stty = [
    'stty -F',
    DEVICE_PATH,
    '9600 -parenb -parodd cs8 -hupcl -cstopb cread clocal -crtscts',
    '-iuclc -ixany -imaxbel -iutf8 -opost -olcuc -ocrnl -onlcr -onocr -onlret -ofill -ofdel',
    'nl0 cr0 tab0 bs0 vt0 ff0 -isig -icanon -iexten -echo -echoe -echok -echonl -noflsh -xcase',
    '-tostop -echoprt -echoctl -echoke',
  ].join(' ')
  shell.exec(stty)

  const code = LED_STATES[status] || 0;
  shell.exec(`echo -en '\\x0${code}' > ${DEVICE_PATH}`)

  console.log('set status LED to ' + status)
}, 10000))
