const Sensor = require('../../lib/sensor');
const expect = require('chai').expect;
const fs = require('fs-extra');
const util = require('../util');

const testSensor = new Sensor({name: 'test', pin: 7});

describe('Sensor class', function() {
    before(async function() {
        await fs.emptyDir('queue');
    });

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

    describe('processUpdate()', function() {
        it('should successfully post to the desired endpoint', async function() {
            const scope = util.mockApiEndpointResponse({});

            await testSensor.processUpdate();
            expect(scope.isDone()).to.be.true;
        });

        it('should add a file to the queue directory if the endpoint can\'t be contacted', async function() {
            const scope = util.mockApiEndpointResponse({returnStatus: 500});

            await testSensor.processUpdate();
            expect(scope.isDone()).to.be.true;
        });

        it('should have written a file to the queue directory', async function() {
            const files = await fs.readdir('queue');

            expect(files).to.have.lengthOf(1);
        });

        it('should contain the correct file contents', async function() {
            const files = await fs.readdir('queue');
            const content = await fs.readJson('queue/' + files[0]);

            expect(content.name).to.equal('test');
            expect(content.timestamp).to.match(/\d+/);
            expect(content.temperature).to.equal(20);
            expect(content.humidity).to.equal(50);
        });
    });
});