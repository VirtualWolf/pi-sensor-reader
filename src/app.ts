import { Sensor } from './lib/sensor';
import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
const config = require('../config.json');
import { checkQueueDirectory } from './lib/queueReader';
import { log } from './lib/logger';

process.on('unhandledRejection', (err: any) => {
    log({ message: err.message });
    log({ message: err.stack });
});

fs.ensureDirSync('queue');

/***************
 *** SENSORS ***
 ***************/

interface Location {
    sensor: Sensor
}

interface Locations extends Array<Location> {}

const locations: Locations = [];

config.sensors.forEach((s: {name: string, type: number, pin: number}) => {
    locations.push({
        sensor: new Sensor({
            name: s.name,
            type: s.type,
            pin: s.pin,
        }),
    });
});

setInterval(async () => {
    for (const location of locations) {
        await location.sensor.readSensor();
        await location.sensor.processUpdate();
    }
}, parseInt(<string>process.env.SENSOR_READ_PERIOD) || require('../config.json').sensorReadPeriod || 20000);

/********************
 *** QUEUE READER ***
 ********************/

setInterval(async () => {
    await checkQueueDirectory();
}, parseInt(<string>process.env.QUEUE_CHECK_PERIOD) || require('../config.json').queueCheckPeriod || 300000);

/**********************
 *** REST ENDPOINTS ***
 **********************/

const app = express();
app.use(cors());

app.get('/rest/:location', (req, res) => {
    const index = locations.findIndex(i => i.sensor.name === req.params.location);

    if (index === -1) {
        return res.status(404).send('Not found');
    }

    const data = locations[index].sensor.getData();

    return res.json({
        temperature: data.temperature.toFixed(1),
        humidity: Math.floor(data.humidity),
        timestamp: data.timestamp,
    });
});

app.listen(3000, () => log({ message: 'Listening on port 3000' }));
