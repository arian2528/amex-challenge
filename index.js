const fastify = require('fastify')({ logger: true, connectionTimeout: 5000, requestIdLogLabel: 'correlationId' });
const { pets, getPetInfo, getPetsInfo, getAsyncPetInfo, getAsyncPetsInfo } = require('./controller/pet-controller');
const {getPetsWorker, getPetWorker} = require('./utils/generatePetsWorker');
const {getAsyncPetWorker} = require('./utils/generatePetWorker')

fastify.get('/pets/:pet', function handler (request, reply) {
  const pet = request.params.pet;
  if (pets.includes(pet)) {
    getAsyncPetInfo(pet, getAsyncPetWorker, request, reply);
  } else {
    reply.code(400).send('Invalid pet type');
  }
})

fastify.get('/pets', function handler (request, reply) {
  const filters = request.params.filters
  getAsyncPetsInfo(getAsyncPetWorker, request, reply);
})

fastify.get('/sync/pets/:pet', function handler (request, reply) {
  const pet = request.params.pet;
  if (pets.includes(pet)) {
    getPetInfo(pet, getAsyncPetWorker, request, reply);
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
