const sensorLib = require('node-dht-sensor');
const request = require('superagent');
const config = require('./config.json');

process.on('unhandledRejection', (err) => {
    console.log(err.message, err.stack);
});

const sensor = {
    read: () => {
        config.sensors.forEach(async sensor => {
            const readout = sensorLib.read(sensor.type, sensor.pin);

            const payload = {
                sensor_name: sensor.name,
                temperature: readout.temperature,
                humidity: readout.humidity,
                timestamp: new Date().getTime(),
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
