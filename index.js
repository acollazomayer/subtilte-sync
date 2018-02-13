const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const moment = require('moment');

function recalculateTime(originalTime, offset) {
  let [ seconds, milliseconds ] = offset.split('.');

  if (offset.includes('-')) {
    seconds = seconds.slice(1);
    return moment(originalTime, 'HH:mm:ss.SSS').subtract({ seconds, milliseconds }).format('HH:mm:ss.SSS');
  }
  return moment(originalTime, 'HH:mm:ss.SSS').add({ seconds, milliseconds }).format('HH:mm:ss.SSS');
}

function main() {
  let subtitles = '';
  const lineReader = readline.createInterface({
    input: fs.createReadStream(argv.file)
  });

  lineReader.on('line', function (line) {
    const time = line.split(' --> ');
    if (time.length === 2) {
      let [ startTime, endTime ] = time;
      syncStartTime = recalculateTime(startTime.replace(',', '.'), argv.offset.toString());
      syncEndTime = recalculateTime(endTime.replace(',', '.'), argv.offset.toString());
      line = [syncStartTime, syncEndTime].join( ' --> ');
    }
    subtitles = subtitles + line + "\r\n";
  });

  lineReader.on('close', function () {
    fs.writeFile(argv.file, subtitles, (error) => {
      if (error) {
        console.log(error.message);
        return
      };
      console.log('Subtitles had been corrected!');
    });
  });
}

main();


