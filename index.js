const fastify = require('fastify')({ logger: true, connectionTimeout: 5000, requestIdLogLabel: 'correlationId' });
const getWorker = require('./utils/generateNewWorker');
const requestTracker = require('./utils/requestTracker');

fastify.get('/getCatsInfo', function handler (request, reply) {
  const getCatsWorker = getWorker('getCatsWorker', Date.now());
  requestTracker[request.id] = (result) => reply.send(result)
  getCatsWorker.postMessage({ requestId: request.id});
})

fastify.get('/getDogsInfo', function handler (request, reply) {
  const getDogsWorker = getWorker('getDogsWorker', Date.now());
  requestTracker[request.id] = (result) => reply.send(result)
  getDogsWorker.postMessage({ requestId: request.id });
})

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
