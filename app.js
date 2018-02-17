const sensorLib = require('node-dht-sensor');
const request = require('superagent');
const express = require('express');
const config = require('./config.json');

const app = express();

const sensorData = {
    outdoor: {
        temperature: null,
        humidity: null,
        timestamp: null,
    },
    indoor: {
        temperature: null,
        humidity: null,
        timestamp: null,
    },
};

app.get('/rest/:sensor', (req, res) => {
    return res.json({
        temperature: sensorData[req.params.sensor].temperature.toFixed(1),
        humidity: Math.floor(parseInt(sensorData[req.params.sensor].humidity)),
        timestamp: sensorData[req.params.sensor].timestamp,
    });
});

app.listen(3000, () => console.log('Listening on port 3000'));

process.on('unhandledRejection', (err) => {
    console.log(err.message, err.stack);
});

const sensor = {
    read: () => {
        config.sensors.forEach(async sensor => {
            const readout = sensorLib.read(sensor.type, sensor.pin);

            const now = new Date().getTime();

            sensorData[sensor.name].temperature = readout.temperature;
            sensorData[sensor.name].humidity = readout.humidity;
            sensorData[sensor.name].timestamp = now;

            const payload = {
                sensor_name: sensor.name,
                temperature: sensorData[sensor.name].temperature,
                humidity: sensorData[sensor.name].humidity,
                timestamp: sensorData[sensor.name].timestamp,
            };

            await request
                .post(config.endpoint)
                .send(payload)
                .set('X-Weather-API', config.apiKey);
        });

        setTimeout(function() {
            sensor.read();
        }, 20000);
    }
};

sensor.read();
