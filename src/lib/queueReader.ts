import fs from 'fs-extra';
import { postUpdate } from './postUpdate';
import { log } from './logger';

export async function checkQueueDirectory () {
    const files = await fs.readdir('queue');

    if (files.length === 0) {
        return;
    }

    for (let file of files) {
        try {
            const content = await fs.readJson('queue/' + file);

            try {
                await postUpdate({
                    sensor_name: content.sensor_name,
                    timestamp: content.timestamp,
                    temperature: content.temperature,
                    humidity: content.humidity,
                });

                await fs.remove('queue/' + file);

                log({message: 'Successfully posted saved update ' + file});
            } catch (err) {
                return;
            }
        } catch (err) {
            log({message: `Couldn't parse JSON in ${file}: ${err}`});
        }
    }
}
