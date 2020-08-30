# Pi Sensor Reader
This is my Raspberry Pi-powered replacement for my [Ninja Block Serial Port Reader](https://github.com/VirtualWolf/ninjablock-serial-port-reader) to read from an attached AM2303/DHT22/DHT11 temperature sensor and send the data via HTTP to a specified endpoint. It uses the [node-dht-sensor](https://github.com/momenso/node-dht-sensor) library and assumes AM2302/DHT22 temperature/humidity sensors.

It requires a config file called `config.json` at the root of the repostory, multiple sensors can be added by adding to the `sensors` array. A fully-filled out file looks like this:

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
                "pin": 17,
                "checkTemperatureDifference": true,
                "temperatureDifferenceThreshold": 0.3
            }
        ],
        "endpoint": "http://example.com/update",
        "apiKey": "password",
        "sensorReadPeriod": 20000,
        "queueCheckPeriod": 300000,
    }

It includes a local Express server running on port 3000 that returns the latest temperature, humidity, and timestamp of the latest sensor reading, and is located at `http://localhost:3000/rest/<sensor-name-from-config-file>`.

## Per-sensor options
* `name` — Required. The name of the sensor, used when sending updates and for the Express server.
* `pin` — Required. The GPIO pin number on the Raspberry Pi the sensor is connected to, see [node-dht-sensor](https://github.com/momenso/node-dht-sensor) for details.
* `type` — Optional. The type of sensor, one of `11` (for DHT11) or `22` (for AM2302/DHT22), see [node-dht-sensor](https://github.com/momenso/node-dht-sensor) for details. Defaults to `22` if not specified.
* `checkTemperatureDifference` — Optional. Allows for checking and discarding of spuriously high or low readings when compared to the previous reading. (My indoor sensor will very occasionally decide the temperature is ten degrees or more higher or lower than what it actually is). Defaults to `false` if not specified.
* `temperatureDifferenceThreshold` — Optional. The value in degrees above or below the previous reading at which a new reading should be discarded. Defaults to `0.3` if not specified and `checkTemperatureDifference` is `true`.

## Global options
* `endpoint` — Optional if the `LOCAL_ONLY` environment variable is set, required if not. The URL to post updates to, which will arrive as JSON in the form of `{"sensor_name":"<name>","timestamp","<unix-timestamp">,"temperature","<temperature>","humidity":"<humidity>"}`.
* `apiKey` — Optional if the `LOCAL_ONLY` environment variable is set, required if not. Updates will be posted to the `endpoint` above with the `X-Weather-API` header set to this value.
* `sensorReadPeriod` — Optional. The interval between sensor readings. Specified in milliseconds and defaults to `20000` (20 seconds) if not specified.
* `queueCheckPeriod` — Optional. When the `LOCAL_ONLY` environment variable is not set, updates which fail to be sent to the URL given in `endpoint` (due to intermittent network flakiness for example) will be written to the `queue` directory at the root level of this repository. `queueCheckPeriod` configures how often this directory should be read and updates attempted to be re-sent. Specified in milliseconds and defaults to `300000` (300 seconds, five minutes) if not specified.

## Environment variables
* `DEBUG` can be set to enable additional debug logging.
* `LOCAL_ONLY` can be set to skip sending updates to the HTTP endpoint, in which case the `endpoint` and `apiKey` options in `config.json` can be entirely omitted (the Express server at port 3000 remains running).
* The `endpoint`, `apiKey`, `sensorReadPeriod`, and `queueCheckPeriod` options in `config.json` file can be overridden with `API_ENDPOINT`, `API_KEY`, `SENSOR_READ_PERIOD`, and `QUEUE_CHECK_PERIOD` respectively.

## Running
### With Docker
A `docker-compose.yml` file is included, run `sudo docker-compose up -d` to bring up the container and keep it running even after system reboots.

To run it as a local-only system without trying to send data to an HTTP endpoint, set `LOCALONLY=true` in the `environment` section of `docker-compose.yml`:

```
version: '3.3'
services:
  reader:
    [...]
    environment:
      - LOCAL_ONLY=true
```

The Dockerfile is based off `arm32v6/node` so it can be built on both a full-size Raspberry Pi and the Pi Zero/Zero W.

### Without Docker
This project is written in TypeScript, compilation is done with `npm run compile`. Javascript files are output to the `build` directory and once compiled the application can be started with `npm start`.

## Tests
Run with `npm test`.
