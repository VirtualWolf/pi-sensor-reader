import { checkQueueDirectory } from '../../src/lib/queueReader';
import { expect } from 'chai';
import fs from 'fs-extra';
import moment from 'moment-timezone';
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
        describe('Basic queue checking', function() {
            before(async function() {
                await writeToQueue({
                    sensor_name: 'test',
                    timestamp: moment().unix(),
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

        describe('Malformed files', function() {
            const one = moment().unix();
            const two = moment().add(1, 'minute').unix();

            before(async function() {
                await fs.ensureFile(`queue/${one}.json`);

                await writeToQueue({
                    sensor_name: 'test',
                    timestamp: two,
                    temperature: 30,
                    humidity: 40,
                });
            });

            it('should skip the malformed file and successfully post the correctly-formed one', async function() {
                const scope = mockApiEndpointResponse({temperature: 30, humidity: 40, returnStatus: 204});

                await checkQueueDirectory();

                const files = await fs.readdir('queue');

                expect(files).to.have.lengthOf(1);
                expect(files[0]).to.equal(`${one}.json`);
                expect(scope.isDone()).to.be.true;
            });
        });
    });
});
