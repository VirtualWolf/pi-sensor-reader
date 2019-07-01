# Pi Sensor Reader
This is my Raspberry Pi-powered replacement for my [Ninja Block Serial Report Reader](https://bitbucket.org/VirtualWolf/ninjablock-serial-port-reader). It uses the [`node-dht-sensor`](https://github.com/momenso/node-dht-sensor) library and I'm using AM2302 temperature/humidity sensors.

It requires a config file called `config.json` at the root of the repostory, mine looks like this:

    {
        "sensors": [
            {
                "name": "outdoor",
                "type": 22,
                "pin": 4
            },
            {
                "name": "indoor",
                "type": 22,
                "pin": 17
            }
        ],
        "endpoint": "http://example.com/update",
        "apiKey": "password"
    }

`pin` is the GPIO pin number on the Raspberry Pi that the sensor is connected to, and `type` is `22` for DH22 or AM2302 sensors (see the `node-dht-sensor` repository above for details on both). `type` defaults to 22 so can be excluded entirely if using DHT22 or AM2302 sensors.

## Running
This has been converted to TypeScript, compilation and running is done as one with `npm start`. Javascript files are output to the `build` directory.

## Environment variables
* The `endpoint` and `apiKey` options in the `config.json` file can be overridden with `API_ENDPOINT` and `API_KEY`.
* A mock sensor for non-Raspberry Pi-based testing can be enabled by setting `ENABLE_MOCK_SENSOR`.
* The interval at which to read the sensor(s) can be set with `SENSOR_READ_PERIOD` and is specified in milliseconds (defaults to 20 seconds).
* The interval at which to check the `queue` directory for unprocessed messages and try to send them can be set with `QUEUE_CHECK_PERIOD` and is specified in milliseconds (defaults to 5 minutes).

## Tests
Run with `npm test`.