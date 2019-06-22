const sensorLib = require('node-dht-sensor').promises;
const request = require('superagent');
const endpoint = process.env.API_ENDPOINT || require('../config.json').endpoint;
const apiKey = process.env.API_KEY || require('../config.json').apiKey;

if (process.env.ENABLE_MOCK_SENSOR) {
    sensorLib.initialize({
        test: {
            fake: {
                temperature: 20,
                humidity: 50,
            }
        }
    });
}

module.exports = class Sensor {
    constructor({name, type = 22, pin}) {
        this.name = name;
        this.type = type;
        this.pin = pin;

        this.temperature = null;
        this.humidity = null;
        this.timestamp = null;
    }

    async readSensor() {
        try {
            const readout = await sensorLib.read(this.type, this.pin);

            this.temperature = readout.temperature;
            this.humidity = readout.humidity;
            this.timestamp = new Date().getTime();
        } catch (err) {
            console.error('Failed to read sensor data: ' + err);
        }
    }

    async postUpdate() {
        try {
            await request
                .post(endpoint)
                .set('X-Weather-API', apiKey)
                .send({
                    sensor_name: this.name,
                    temperature: this.temperature,
                    humidity: this.humidity,
                    timestamp: this.timestamp,
                });
        } catch (err) {
            console.error(`Error while posting update for timestamp ${this.timestamp}. Status: ${err.status}; Reason: ${err.message}`);
        }
    }

    getData() {
        return {
            timestamp: this.timestamp,
            temperature: this.temperature,
            humidity: this.humidity,
        };
    }
};