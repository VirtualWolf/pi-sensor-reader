import fs from 'fs-extra';
import { Payload } from '../interface/Payload';

export async function writeToQueue(payload: Payload) {
    await fs.writeJson(`queue/${payload.timestamp}.json`, {
        sensor_name: payload.sensor_name,
        timestamp: payload.timestamp,
        temperature: payload.temperature,
        humidity: payload.humidity,
    });
};