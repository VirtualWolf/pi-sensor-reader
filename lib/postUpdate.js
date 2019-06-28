const request = require('superagent');
const endpoint = process.env.API_ENDPOINT || require('../config.json').endpoint;
const apiKey = process.env.API_KEY || require('../config.json').apiKey;

module.exports = async function postUpdate({sensor_name, timestamp, temperature, humidity}) {
    await request
        .post(endpoint)
        .set('X-Weather-API', apiKey)
        .send({
            sensor_name,
            timestamp,
            temperature,
            humidity,
        });
};