const fs = require('fs-extra');

module.exports = async function writeToQueue({sensor_name, timestamp, temperature, humidity}) {
    await fs.writeJson(`queue/${timestamp}.json`, {
        sensor_name,
        timestamp,
        temperature,
        humidity,
    });
};