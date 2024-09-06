const { Worker } = require('worker_threads');
const path = require('path');
const requestTracker = require('./requestTracker');
const workerTracker = require('./workerTracker');

const WORKER_IDLE_TIME = 1*60*1000;

const getWorker = (workerName) => {
  const currentTime = Date.now();
  
  if (!workerTracker[workerName] || (currentTime - workerTracker[workerName].startedTime) > WORKER_IDLE_TIME) {
    workerTracker[workerName] = {startedTime: currentTime, worker: generateNewWorker(workerName)};
  }

  return workerTracker[workerName].worker; 
}

const terminateWorker = (workerName, worker) => {
  if (workerTracker[workerName]) {
    console.log('Terminating worker:', workerName);
    worker.terminate();
    delete workerTracker[workerName];
  }
}

const generateNewWorker = (workerName) => {
  console.log('Creating new worker:', workerName);
  const worker = new Worker(path.join(__dirname, '../workers', 'pets'));
  worker.on('message', (data) => {
    const { response, requestId } = data;
    requestTracker[requestId](response);
    delete requestTracker[requestId];
  });
  worker.on('error', () => {
    terminateWorker(workerName, worker);
  });

  setTimeout(() => { 
    terminateWorker(workerName, worker);
  },WORKER_IDLE_TIME);
  return worker;
}

module.exports = getWorker;