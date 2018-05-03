const fs = require('fs')
const shell = require('shelljs')
const {wrapRetry} = require('../utils')
const {LED_STATES} = require('../constants')

module.exports = options => {
  const {interval = 2000, devicePath = '/dev/ttyACM0'} = options.modules.serial || {}

  let lastStatus

  fs.watchFile(
    devicePath,
    {
      persistent: false,
      interval,
    },
    function(stat) {
      // ino: inode number. If non-zero, the file exists, and we can write there
      if (stat.ino && lastStatus) {
        write(lastStatus)
      }
    }
  )

  const write = wrapRetry(async status => {
    lastStatus = status
    // make sure file exists
    fs.statSync(devicePath)

    const stty = [
      'stty -F',
      devicePath,
      '9600 -parenb -parodd cs8 -hupcl -cstopb cread clocal -crtscts',
      '-iuclc -ixany -imaxbel -iutf8 -opost -olcuc -ocrnl -onlcr -onocr -onlret -ofill -ofdel',
      'nl0 cr0 tab0 bs0 vt0 ff0 -isig -icanon -iexten -echo -echoe -echok -echonl -noflsh -xcase',
      '-tostop -echoprt -echoctl -echoke',
    ].join(' ')
    shell.exec(stty)

    const code = LED_STATES[status] || 0
    shell.exec(`echo -en '\\x0${code}' > ${devicePath}`)

    console.log('set status LED to ' + status)
  }, 10000)

  return write
}
