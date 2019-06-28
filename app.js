const Sensor = require('./lib/sensor');
const express = require('express');
const fs = require('fs-extra');
const config = require('./config.json');
const queueReader = require('./queueReader');
const logger = require('./lib/logger');

process.on('unhandledRejection', (err) => {
    logger.log(err.message, err.stack);
});

fs.ensureDirSync('queue');





/* === SENSORS === */
const locations = [];

config.sensors.forEach(s => {
    locations.push({
        sensor: new Sensor({
            name: s.name,
            type: s.type,
            pin: s.pin,
        }),
    });
});

async function readSensors () {
    for (const location of locations) {
        await location.sensor.readSensor();
        await location.sensor.processUpdate();
    }

    setTimeout(async () => {
        await readSensors();
    }, process.env.SENSOR_READ_PERIOD || 20000);
}

readSensors();





/* === QUEUE READER === */
async function readQueue() {
    await queueReader.checkQueueDirectory();

    setTimeout(async () => {
        await readQueue();
    }, process.env.QUEUE_CHECK_PERIOD || 300000);
}

readQueue();





/* === REST ENDPOINTS === */
const app = express();

app.get('/rest/:location', (req, res) => {
    const index = locations.findIndex(i => i.sensor.name === req.params.location);

    if (index === -1) {
        return res.status(404).send('Not found');
    }

    const data = locations[index].sensor.getData();

    return res.json({
        temperature: data.temperature.toFixed(1),
        humidity: Math.floor(parseInt(data.humidity)),
        timestamp: data.timestamp,
    });
});

app.listen(3000, () => logger.log('Listening on port 3000'));
