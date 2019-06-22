const rewire = require('rewire');
const Sensor = rewire('../../lib/sensor');
const expect = require('chai').expect;
const nock = require('nock');

const testSensor = new Sensor({name: 'test', pin: 7});

describe('Sensor class', function() {
    describe('readSensor()', function() {
        it('should run successfully', async function() {
            try {
                await testSensor.readSensor();
            } catch (err) {
                expect(err).to.be.undefined;
            }
        });
    });

    describe ('getData()', function() {
        it('should return the correct values', function(done) {
            const result = testSensor.getData();

            expect(result.temperature).to.equal(20);
            expect(result.humidity).to.equal(50);
            expect(result.timestamp).to.be.a('number');

            done();
        });
    });

    describe('postUpdate()', function() {
        it('should successfully post to the desired endpoint', async function() {
            const scope = nock(process.env.API_ENDPOINT, {
                reqheaders: {
                    'x-weather-api': process.env.API_KEY
                }
            })
                .post('/', {
                    sensor_name: 'test',
                    temperature: 20,
                    humidity: 50,
                    timestamp: /.+/i,
                })
                .reply(204);

            await testSensor.postUpdate();
            expect(scope.isDone()).to.be.true;
        });
    });
});