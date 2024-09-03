const { Worker } = require('worker_threads');
const path = require('path');
const requestTracker = require('./requestTracker');
const workerTracker = require('./workerTracker');

const WORKER_IDLE_TIME = 15*60*1000;

const getWorker = (workerName, currentTime) => {
  if (!workerTracker[workerName] || (currentTime - workerTracker[workerName].startedTime) > WORKER_IDLE_TIME) {
    workerTracker[workerName] = {startedTime: currentTime, worker: generateNewWorker(workerName)};
  }

  return workerTracker[workerName].worker; 
}

const generateNewWorker = (workerName) => {
  console.log('Creating new worker:', workerName);
  const worker = new Worker(path.join(__dirname, '../workers', workerName));
  worker.on('message', (data) => {
    const { response, requestId } = data;
    requestTracker[requestId](response);
    delete requestTracker[requestId];
  });
  worker.on('error', () => {
    worker.terminate();
  });

  setTimeout(() => { 
    console.log('Terminating worker:', workerName);
    worker.terminate()
  },WORKER_IDLE_TIME);
  return worker;
}

module.exports = getWorker;