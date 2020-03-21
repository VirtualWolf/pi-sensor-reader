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

interface SensorParameters {
    name: string;
    type: number;
    pin: number;
    checkTemperatureDifference?: boolean;
    temperatureDiffenceThreshold?: number;
}

export class Sensor {
    public name: string;

    private type: number = 22;
    private pin: number;
    private checkTemperatureDifference: boolean;
    private temperatureDifferenceThreshold: number;

    private temperature: number = 0;
    private humidity: number = 0;
    private timestamp: number = 0;

    constructor({name, type, pin, checkTemperatureDifference = false, temperatureDiffenceThreshold = 0.3}: SensorParameters) {
        this.name = name;
        this.type = type;
        this.pin = pin;
        this.checkTemperatureDifference = checkTemperatureDifference;
        this.temperatureDifferenceThreshold = temperatureDiffenceThreshold;
    }

    async readSensor() {
        try {
            const readout = await sensorLib.read(this.type, this.pin);

            if (this.temperature === 0 && this.humidity === 0) {
                log(`[${this.name}] First run of application, setting first reading: ${readout.temperature}˚ and ${readout.humidity}%.`);

                this.temperature = readout.temperature;
                this.humidity = readout.humidity;
                this.timestamp = new Date().getTime();

                return;
            }

            if (this.checkTemperatureDifference) {
                // Check the absolute difference between the two values, and if they
                // differ by more than the threshold (0.3 degrees if not specified),
                // don't update this.temperature.
                // This helps guard against both the sensor giving weird spurious
                // temperatures, and also inadvertent direct sunlight on the sensor
                // during certain times of day!
                const difference = Math.abs(this.temperature - readout.temperature);

                if (difference > this.temperatureDifferenceThreshold) {
                    log(`[${this.name}] Skipping because difference is too large. Currently ${this.temperature}, got ${readout.temperature}`);

                    return;
                }
            }

            this.temperature = readout.temperature;
            this.humidity = readout.humidity;
            this.timestamp = new Date().getTime();
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
