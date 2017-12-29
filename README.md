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
        "mapping": {
            "outdoor": {
                "device": "0404",
                "temperature": "31",
                "humidity": "30"
            },
            "indoor": {
                "device": "0904",
                "temperature": "31",
                "humidity": "30"
            }
        },
        "endpoint": "http://example.com/update",
        "apiKey": "password"
    }

The `mapping` section is there so it's sending its data in exactly the same format as the old Ninja Block Sensor used to (I'm lazy and haven't felt like updating my website's code yet).