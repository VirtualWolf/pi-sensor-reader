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

            const temperature = {
                G: config.mapping[sensor.name].device,
                D: config.mapping[sensor.name].temperature,
                DA: readout.temperature,
                TIMESTAMP: new Date().getTime(),
            };

            const humidity = {
                G: config.mapping[sensor.name].device,
                D: config.mapping[sensor.name].humidity,
                DA: readout.humidity,
                TIMESTAMP: new Date().getTime(),
            };

            await request
                .post(config.endpoint)
                .send(temperature)
                .set('X-Weather-API', config.apiKey);

            await request
                .post(config.endpoint)
                .send(humidity)
                .set('X-Weather-API', config.apiKey);
        });

        setTimeout(function() {
            sensor.read();
        }, 20000);
    }
};

sensor.read();
