const fs = require('fs-extra');
const postUpdate = require('./lib/postUpdate');
const logger = require('./lib/logger');

module.exports = {
    checkQueueDirectory: async () => {
        const files = await fs.readdir('queue');

        if (files.lengthOf === 0) {
            return;
        }

        for (let file of files) {
            const content = await fs.readJson('queue/' + file);

            try {
                await postUpdate({
                    sensor_name: content.sensor_name,
                    timestamp: content.timestamp,
                    temperature: content.temperature,
                    humidity: content.humidity,
                });

                await fs.remove('queue/' + file);
            } catch (err) {
                logger.log('Unable to contact endpoint, not removing ' + file);
            }
        }
    },
};