const nock = require('nock');

module.exports = {
    mockApiEndpointResponse: ({name = 'test', temperature = 20, humidity = 50, returnStatus = 204}) => {
        return nock(process.env.API_ENDPOINT, {
            reqheaders: {
                'x-weather-api': process.env.API_KEY
            }
        })
            .post('/', {
                sensor_name: name,
                temperature,
                humidity,
                timestamp: /\d+/,
            })
            .reply(returnStatus);
    },
};