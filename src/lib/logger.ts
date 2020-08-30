import moment from 'moment-timezone';

export function log({ message, name, level }: { message: string; name?: string; level?: 'INFO' | 'DEBUG' }) {
    const timestamp = moment().tz('Australia/Sydney').format('YYYY-MM-DD HH:mm:ss');

    if (!process.env.TEST && level !== 'DEBUG') {
        const loggerName = name ? `[${name}] ` : '';

        console.log(`[${timestamp}] ${loggerName}` + message);
    }

    if (process.env.DEBUG && level === 'DEBUG') {
        console.log(`[${timestamp}] [${name}] [DEBUG] ` + message);
    }
}
