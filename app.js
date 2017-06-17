const sensorLib = require('node-dht-sensor');
const request = require('request');

const sensors = [
    {
        name: 'outdoor',
        type: 22,
        pin: 4,
    },
    {
        name: 'indoor',
        type: 22,
        pin: 17,
    }
];

function readSensors() {
    sensors.forEach(sensor => {
        if (initialiseSensors(sensor.type, sensor.pin)) {
            var readout = sensorLib.read();

            var data = {
                sensor: sensor.name,
                timestamp: new Date().getTime(),
                temperature: readout.temperature.toFixed(1),
                humidity: readout.humidity.toFixed(1),
            };
            console.log(`${sensor.name}: ${data.temperature}˚C & ${data.humidity}%`)
        } else {
            console.log('Couldn\'t initialise ' + sensor.name);
        }
    });

    setTimeout(function() {
        readSensors();
    }, 6000);
}

function initialiseSensors(type, pin) {
    return sensorLib.initialize(type, pin);
}

readSensors();
