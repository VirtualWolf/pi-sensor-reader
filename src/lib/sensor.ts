const sensorLib = require('node-dht-sensor').promises;
import { postUpdate } from './postUpdate';
import { writeToQueue } from './writeToQueue';
import { log } from './logger';

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

export class Sensor {
    public name: string;

    private type: number = 22;
    private pin: number;

    private temperature: number = 0;
    private humidity: number = 0;
    private timestamp: number = 0;

    constructor(params: {name: string, type: number, pin: number}) {
        this.name = params.name;
        this.type = params.type;
        this.pin = params.pin;
    }

    async readSensor() {
        try {
            const readout = await sensorLib.read(this.type, this.pin);

            this.temperature = readout.temperature;
            this.humidity = readout.humidity;
            this.timestamp = new Date().getTime();
        } catch (err) {
            log('Failed to read sensor data: ' + err);
        }
    }

    async processUpdate() {
        try {
            await postUpdate({
                sensor_name: this.name,
                timestamp: this.timestamp,
                temperature: this.temperature,
                humidity: this.humidity,
            });
        } catch (err) {
            log(`Error while posting update for ${this.name} at timestamp ${this.timestamp}. Status: ${err.status}; Reason: ${err.message}`);
            try {
                await writeToQueue({
                    sensor_name: this.name,
                    timestamp: this.timestamp,
                    temperature: this.temperature,
                    humidity: this.humidity,
                });
            } catch (err) {
                log('Failed to write file: ' + err);
            }
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