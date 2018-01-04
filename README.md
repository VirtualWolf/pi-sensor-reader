# Pi Sensor Reader
This is my Raspberry Pi-powered replacement for my [Ninja Block Serial Report Reader](https://bitbucket.org/VirtualWolfCo/ninjablock-serial-port-reader). It uses the [`node-dht-sensor`](https://github.com/momenso/node-dht-sensor) library and I'm using AM2302 temperature/humidity sensors.

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

`pin` is the GPIO pin number that the sensor is connected to, and `type` is `22` for the AM2302 sensors (see the `node-dht-sensor` repository above for details on both).
