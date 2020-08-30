const sensorLib = require('node-dht-sensor').promises;
import { postUpdate } from './postUpdate';
import { writeToQueue } from './writeToQueue';
import { log } from './logger';

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
            const { temperature, humidity } = await sensorLib.read(this.type, this.pin);

            if (this.temperature === 0 && this.humidity === 0) {
                log({
                    message: `First run of application, setting first reading: ${temperature}˚ and ${humidity}%`,
                    name: this.name,
                });

                if (this.checkTemperatureDifference) {
                    log({
                        message: `Enabling temperature differential checking, threshold set to ${this.temperatureDifferenceThreshold}`,
                        name: this.name,
                    });
                }

                this.temperature = temperature;
                this.humidity = humidity;
                this.timestamp = new Date().getTime();

                return;
            }

            log({ message: `New readout: ${temperature}˚ and ${humidity}%.`, name: this.name, level: 'DEBUG' });

            if (this.checkTemperatureDifference) {
                // Check the absolute difference between the two values, and if they
                // differ by more than the threshold (0.3 degrees if not specified),
                // don't update this.temperature.
                // This helps guard against both the sensor giving weird spurious
                // temperatures, and also inadvertent direct sunlight on the sensor
                // during certain times of day!
                const difference = Math.abs(this.temperature - temperature);

                log({
                    message: 'Temperature difference: ' + difference,
                    name: this.name,
                    level: 'DEBUG',
                });

                if (difference > this.temperatureDifferenceThreshold) {
                    log({
                        message: `Skipping because difference is too large. Currently ${this.temperature}, got ${temperature}`,
                        name: this.name,
                    });

                    return;
                }
            }

            log({
                message: `Successfully updated with new readout: ${temperature}˚ and ${humidity}%`,
                name: this.name,
                level: 'DEBUG',
            });

            this.temperature = temperature;
            this.humidity = humidity;
            this.timestamp = new Date().getTime();
        } catch (err) {
            log({ message: `Failed to read sensor data: ${err}`, name: this.name });
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
            log({
                message:
                `Error while posting update for ${this.name} at timestamp ${this.timestamp}. Status: ${err.status}; Reason: ${err.message}`,
                name: this.name,
            });

            try {
                await writeToQueue({
                    sensor_name: this.name,
                    timestamp: this.timestamp,
                    temperature: this.temperature,
                    humidity: this.humidity,
                });
            } catch (err) {
                log({
                    message: 'Failed to write file: ' + err,
                    name: this.name,
                });
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
