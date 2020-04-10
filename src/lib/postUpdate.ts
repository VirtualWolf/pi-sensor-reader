import request from 'superagent';
import { Payload } from '../interface/Payload';

export async function postUpdate(payload: Payload) {
    if (process.env.LOCAL_ONLY) {
        return;
    }

    const endpoint = process.env.API_ENDPOINT || require('../../config.json').endpoint;
    const apiKey = process.env.API_KEY || require('../../config.json').apiKey;

    await request
        .post(endpoint)
        .set('X-Weather-API', apiKey)
        .send({
            sensor_name: payload.sensor_name,
            timestamp: payload.timestamp,
            temperature: payload.temperature,
            humidity: payload.humidity,
        });
};