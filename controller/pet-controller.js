const requestTracker = require('../utils/requestTracker');

const pets = ['cats', 'dogs'];

// Get Pet info
const getPetInfo = (pet, getPetWorker, request, reply) => {
    const worker = getPetWorker(pet, false);
    requestTracker[pet] = {};
    requestTracker[pet][request.id] = (result) => reply.send(result)
    worker.postMessage({ requestId: request.id, pet });
}

// Get Pets Info
const getPetsInfo = (getPetsWorker, request, reply) => {
    const worker = getPetsWorker(pets);
    requestTracker['pets'] = {};
    requestTracker['pets'][request.id] = (result) => reply.send(result)
    worker.postMessage({ requestId: request.id, workers: pets, parentWorker: true });
}
// Get Pets Info ASync
const getAsyncPetsInfo = async (getAsyncPetWorker, request, reply) => {
    let response = [];
    try {
        for (let i = 0;  i < pets.length; i++) {
            const workerResp = await getAsyncPetWorker(pets[i], true)
            response = [...response, ...workerResp]
        }
        reply.send(response)
    } catch (error) {
        console.log(error)
    }
} 

// Get Pet Info Async
const getAsyncPetInfo = async (pet, getAsyncPetWorker, request, reply) => {
    try {
        const response = await getAsyncPetWorker(pet, true)
        reply.send(response)
    } catch (error) {
        console.log(error)
    } 
}

module.exports = {getPetInfo, getPetsInfo, getAsyncPetInfo, getAsyncPetsInfo, pets};