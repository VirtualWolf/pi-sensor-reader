import { checkQueueDirectory } from '../../src/lib/queueReader';
import { expect } from 'chai';
import 'mocha';
import fs from 'fs-extra';
import { mockApiEndpointResponse } from '../util';
import { writeToQueue } from '../../src/lib/writeToQueue';

describe('queueReader', function() {
    before(async function() {
        await fs.emptyDir('queue');
    });

    after(async function() {
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
            const scope = mockApiEndpointResponse({temperature: 30, humidity: 40, returnStatus: 500});
            await checkQueueDirectory();

            const files = await fs.readdir('queue');
            expect(scope.isDone()).to.be.true;
            expect(files).to.have.lengthOf(1);
        });

        it('should remove the message file if the endpoint was successfully contacted', async function() {
            const scope = mockApiEndpointResponse({temperature: 30, humidity: 40, returnStatus: 204});
            await checkQueueDirectory();

            const files = await fs.readdir('queue');
            expect(scope.isDone()).to.be.true;
            expect(files).to.have.lengthOf(0);
        });
    });
});
