const requestTracker = require('../utils/requestTracker');

const pets = ['cats', 'dogs'];

const getPetInfo = (pet, getWorker, request, reply) => {
    const worker = getWorker(pet);
    requestTracker[request.id] = (result) => reply.send(result)
    worker.postMessage({ requestId: request.id, pet });
}

module.exports = {getPetInfo, pets};