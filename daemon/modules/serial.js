const fs = require('fs')
const shell = require('shelljs')
const {wrapRetry} = require('../utils')
const {LED_STATES} = require('../constants')

module.exports = daemon => {
  const interval = daemon.getConfig('modules.serial.interval', 2000)
  const devicePath = daemon.getConfig('modules.serial.devicePath', '/dev/ttyACM0')

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

  fs.watchFile(
    devicePath,
    {
      persistent: false,
      interval,
    },
    function(stat) {
      if (stat.ino && daemon.currentStatus) {
        write(daemon.currentStatus)
      }
    }
  )

  daemon.on('status', write)
}
