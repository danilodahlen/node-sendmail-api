const fs  = require('fs');
const dateTime = require('date-time');

exports.writeLog = function(type, msg){
    fs.appendFile('log.js', (dateTime() + ' ' + type + ' | ' + msg + '\n'), (err, fd) => {
        if (err) 
            throw err;
    });
}




