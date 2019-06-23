const queueReader = require('../queueReader');
const expect = require('chai').expect;
const fs = require('fs-extra');
const util = require('./util');
const writeToQueue = require('../lib/writeToQueue');

describe('queueReader', function() {
    before(async function() {
        await fs.emptyDir('queue');
    });

    describe('checkQueueDirectory()', function() {
        before(async function() {
            const now = new Date().getTime();
            await writeToQueue({
                sensor_name: 'test',
                timestamp: now,
                temperature: 30,
                humidity: 40,
            });
        });

        it('should not remove a message file if the endpoint can\'t be contacted', async function() {
            const scope = util.mockApiEndpointResponse({temperature: 30, humidity: 40, returnStatus: 500});
            await queueReader.checkQueueDirectory();

            const files = await fs.readdir('queue');
            expect(scope.isDone()).to.be.true;
            expect(files).to.have.lengthOf(1);
        });

        it('should remove the message file if the endpoint was successfully contacted', async function() {
            const scope = util.mockApiEndpointResponse({temperature: 30, humidity: 40, returnStatus: 204});
            await queueReader.checkQueueDirectory();

            const files = await fs.readdir('queue');
            expect(scope.isDone()).to.be.true;
            expect(files).to.have.lengthOf(0);
        });
    });
});