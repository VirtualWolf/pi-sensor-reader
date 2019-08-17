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

            // We only want to check the temperature difference between the
            // latest reading from the sensor and what this.temperature is
            // if this is _not_ the first time the sensor is taking a reading
            // (i.e. the very first reading after application start).
            if (this.temperature !== 0 && this.humidity !== 0) {
                // Check the absolute difference between the two values, and if they
                // differ by more than 0.3 degrees, don't update this.temperature.
                // This helps guard against both the sensor giving weird spurious
                // temperatures, and also inadvertent direct sunlight on the sensor
                // during certain times of day!
                const difference = Math.abs(this.temperature - readout.temperature);

                if (difference <= 0.3) {
                    this.temperature = readout.temperature;
                    this.humidity = readout.humidity;
                    this.timestamp = new Date().getTime();
                } else {
                    log(`[${this.name}] Skipping because difference is too large. Currently ${this.temperature}, got ${readout.temperature}`);
                    return;
                }
            } else {
                log(`[${this.name}] First run of application, setting first reading`)
                this.temperature = readout.temperature;
                this.humidity = readout.humidity;
                this.timestamp = new Date().getTime();
            }
        } catch (err) {
            log(`[${this.name}] Failed to read sensor data: ${err}`);
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
