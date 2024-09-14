const { Worker, isMainThread, parentPort } = require('worker_threads');
const path = require('path');
const requestTracker = require('./requestTracker');
const workerTracker = require('./workerTracker');

const WORKER_IDLE_TIME = 1*60*1000;

const getAsyncPetWorker = (pet, isAsync) => {
  const currentTime = Date.now();
  
  if (!workerTracker[pet] || (currentTime - workerTracker[pet].startedTime) > WORKER_IDLE_TIME) {
    workerTracker[pet] = {startedTime: currentTime, worker: isAsync ? generateAsyncNewWorker(pet) : generateSyncNewWorker(pet)};
  }

  return workerTracker[pet].worker; 
}

const terminateWorker = (pet, worker) => {
  if (workerTracker[pet]) {
    console.log('Terminating worker:', pet);
    worker.terminate();
    delete workerTracker[pet];
  }
}

const generateAsyncNewWorker = (pet) => {
  return new Promise((res, rej) => {
    console.log('Creating async worker:', pet)
    const worker = new Worker(path.join(__dirname, '../workers', 'pet'));
    worker.on('message', (data) => {
      const { response } = data;
      res(response)
    })

    worker.on('error', () => {
      terminateWorker(pet, worker);
      rej('Error from Worker: ', pet)
    });

    worker.postMessage({pet})

    setTimeout(() => { 
      terminateWorker(pet, worker);
    }, WORKER_IDLE_TIME);
    
    return worker;
  });
}

// There is bug. Need to differentiate between Sync and Async workers
const generateSyncNewWorker = (pet) => {
  console.log('Creating sync worker:', pet)
  const worker = new Worker(path.join(__dirname, '../workers', 'pet'));
  worker.on('message', (data) => {
    const { response, requestId } = data;
    if (isMainThread) requestTracker[pet][requestId](response);
  });
  worker.on('error', () => {
    terminateWorker(pet, worker);
  });

  setTimeout(() => { 
    terminateWorker(pet, worker);
  },WORKER_IDLE_TIME);
  return worker;
}

module.exports = {getAsyncPetWorker}