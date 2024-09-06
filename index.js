const fastify = require('fastify')({ logger: true, connectionTimeout: 5000, requestIdLogLabel: 'correlationId' });
const { pets, getPetInfo } = require('./controller/pet-controller');
const getWorker = require('./utils/generateNewWorker');

fastify.get('/pets/:pet', function handler (request, reply) {
  const pet = request.params.pet;
  if (pets.includes(pet)) {
    getPetInfo(pet, getWorker, request, reply);
  } else {
    reply.code(400).send('Invalid pet type');
  }
})

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
