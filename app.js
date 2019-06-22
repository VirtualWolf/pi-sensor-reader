const Sensor = require('./lib/sensor');
const express = require('express');
const config = require('./config.json');

process.on('unhandledRejection', (err) => {
    console.log(err.message, err.stack);
});





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
        await location.sensor.postUpdate();
    }

    setTimeout(async () => {
        await readSensors();
    }, process.env.SENSOR_READ_PERIOD || 20000);
}

readSensors();





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

app.listen(3000, () => console.log('Listening on port 3000'));
