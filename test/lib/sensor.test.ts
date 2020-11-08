const sensorLib = require('node-dht-sensor').promises;
import { Sensor } from '../../src/lib/sensor';
import sinon from 'sinon';
import { expect } from 'chai';
import fs from 'fs-extra';
import { mockApiEndpointResponse } from '../util';

const options = {
    name: 'test',
    type: 22,
    pin: 7,
    checkTemperatureDifference: true,
    temperatureDiffenceThreshold: 0.8,
};

describe('Sensor class', function() {
    before(async function() {
        await fs.emptyDir('queue');
    });

    after(async function() {
        await fs.emptyDir('queue');
    });

    describe('readSensor()', function() {
        describe('Basic read', function() {
            before(function() {
                this.sensor = new Sensor(options);
                this.stub = sinon.stub(sensorLib, 'read');

                this.stub.resolves({temperature: 23.0, humidity: 24});
            });

            after(function() {
                this.stub.restore();
            });

            it('should run successfully', async function() {
                try {
                    await this.sensor.readSensor();
                } catch (err) {
                    expect(err).to.be.undefined;
                }
            });
        });

        describe('Check temperature difference', function() {
            before(async function() {
                this.sensor = new Sensor(options);
                this.stub = sinon.stub(sensorLib, 'read');

                this.stub.resolves({temperature: 30.0, humidity: 20});

                await this.sensor.readSensor();
            });

            after(function() {
                this.stub.restore();
            });

            it('should reject a temperature difference of more than 0.8 degrees', async function() {
                this.stub.resolves({temperature: 30.9, humidity: 25});

                await this.sensor.readSensor();

                const { temperature, humidity, timestamp } = this.sensor.getData();

                expect(temperature).to.equal(30.0);
                expect(humidity).to.equal(20);
                expect(timestamp).to.be.a('number');
            });

            it('should update with a temperature difference of 0.7 degrees', async function() {
                this.stub.resolves({temperature: 30.7, humidity: 20});

                await this.sensor.readSensor();

                const { temperature, humidity, timestamp } = this.sensor.getData();

                expect(temperature).to.equal(30.7);
                expect(humidity).to.equal(20);
                expect(timestamp).to.be.a('number');
            });
        });
    });

    describe ('getData()', function() {
        before(async function() {
            this.sensor = new Sensor(options);
            this.stub = sinon.stub(sensorLib, 'read');

            this.stub.resolves({temperature: 21.5, humidity: 51});

            await this.sensor.readSensor();
        });

        after(function() {
            this.stub.restore();
        });

        it('should return the correct values', function(done) {
            const { temperature, humidity, timestamp } = this.sensor.getData();

            expect(temperature).to.equal(21.5);
            expect(humidity).to.equal(51);
            expect(timestamp).to.be.a('number');

            done();
        });
    });

    describe('processUpdate()', function() {
        before(async function() {
            this.sensor = new Sensor(options);
            this.stub = sinon.stub(sensorLib, 'read');

            this.stub.resolves({temperature: 15, humidity: 45});

            await this.sensor.readSensor();
        });

        after(function() {
            this.stub.restore();
        });

        it('should successfully post to the desired endpoint', async function() {
            const scope = mockApiEndpointResponse({temperature: 15, humidity: 45});

            await this.sensor.processUpdate();

            expect(scope.isDone()).to.be.true;
        });

        it('should add a file to the queue directory if the endpoint can\'t be contacted', async function() {
            const scope = mockApiEndpointResponse({temperature: 15, humidity: 45, returnStatus: 500});

            await this.sensor.processUpdate();

            expect(scope.isDone()).to.be.true;
        });

        it('should have written a file to the queue directory', async function() {
            const files = await fs.readdir('queue');

            expect(files).to.have.lengthOf(1);
        });

        it('should contain the correct file contents', async function() {
            const files = await fs.readdir('queue');

            const content = await fs.readJson('queue/' + files[0]);

            expect(content.sensor_name).to.equal('test');
            expect(content.timestamp).to.match(/\d+/);
            expect(content.temperature).to.equal(15);
            expect(content.humidity).to.equal(45);
        });
    });
});
