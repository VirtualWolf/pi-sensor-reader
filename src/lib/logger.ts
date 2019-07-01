import moment from 'moment-timezone';

export function log(message: string) {
    const timestamp = moment().tz('Australia/Sydney').format('YYYY-MM-DD HH:mm:ss');

    console.log(`[${timestamp}] ` + message);
}