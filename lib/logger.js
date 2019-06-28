const moment = require('moment-timezone');

module.exports = {
    log: (message) => {
        const timestamp = moment().tz('Australia/Sydney').format('YYYY-MM-DD HH:mm:ss');

        console.log(`[${timestamp}] ` + message);
    }
};