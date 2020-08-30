import nock from 'nock';

export const mockApiEndpointResponse = ({name = 'test', temperature = 20, humidity = 50, returnStatus = 204}) => {
    return nock(process.env.API_ENDPOINT || 'localhost', {
        reqheaders: {
            'x-weather-api': process.env.API_KEY || 'password'
        }
    })
        .post('/', {
            sensor_name: name,
            temperature,
            humidity,
            timestamp: /\d+/,
        })
        .reply(returnStatus);
}
