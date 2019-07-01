import request from 'superagent';
import { Payload } from '../interface/Payload';
const endpoint = process.env.API_ENDPOINT || require('../../config.json').endpoint;
const apiKey = process.env.API_KEY || require('../../config.json').apiKey;

export async function postUpdate(payload: Payload) {
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