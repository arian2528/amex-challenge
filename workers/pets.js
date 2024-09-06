const { parentPort } = require('worker_threads');
const mockFetch = require('../utils/mockFetch');

const cachedTokensMap = new Map();

const refreshToken = async (data) => {
  try {
    const refreshedToken = await invokeTokenService(data.key);
    cachedTokensMap.set(data.key, { token:refreshedToken });
  } catch (error) {
    console.log('refreshToken error:', error);
    throw error;
  }
}

const invokeTokenService = async (key) => {
  return `${key}-${Date.now()}`;
}

const generateToken = async (data) => {
  if (!cachedTokensMap.has(data.key)) {
    const token = await invokeTokenService(data.key);
    cachedTokensMap.set(data.key, { token });
    setTimeout(() => refreshToken(data), 5000);
    return token;
  } else {
    return cachedTokensMap.get(data.key).token;
  }
}
/* 
 - The 'cats' api needs the token which is generated by the 'token' api.
 - Token expires every 7 seconds, 
 - so we refresh token every 5 sec to keep it available before next request.
*/
const handleMessage = async (pet) => {
  console.log(`handling request to get ${pet}`);
  const token = pet === 'cats' ? await generateToken({ key: 'token-key'}) : null;
  const response = await mockFetch(pet, token);
  return response;
}
/*
- Process the request from the main thread, and respond back with the data.
*/
parentPort.on('message', async (message) => {
  try {
    const response = await handleMessage(message.pet);
    parentPort.postMessage({ response, requestId: message.requestId });
  } catch (error) {
    console.log(`handleResponse ${message.pet} worker error:`, error)
    parentPort.postMessage({ response: `error response from ${message.pet} worker`, requestId: message.requestId });
  }
});