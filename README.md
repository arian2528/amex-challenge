## Task 1 - Identify and fix the issue with getCatsInfo API

After testing the ebdpoint I norrow down the issue to the generateToken function
Once debugged I found that the mapping of the key that identify the cachedTokensMap value was incorrect. The object 'data' does not contain a value property. The bug was hidden inside the timeOut used to make sure the token are refreash every 5 seconds.

File changed: workers/getCatsWorker.js
Fucntion: refreshToken
Line: const refreshedToken = await invokeTokenService(data.value.key);
Replaced: data.value.key with data.key

Recomendations: Instead of setting a timeout to make sure it will have an updated token. Set an expiration time for teh token. On each request make sure the token has not expired. If so, generate a new one as it is done whwen tehre are not values in the cachedTokensMap constant.

## Task 2 - Add correlationId header to all the requests and response

File changed: index.js
Changes: Added requestIdLogLabel: correlationId to the fastify options

## Task 3 - Terminate the idle worker and recreate when needed

File changed: index.js, generateNewWorker.js, utils/workerTracker.js

Terminate the new worker by setting a timeout when creating a new Worker.
Instead of creating the worker on load, wait until a request is made to create the worker.
Use a workerTracker to track the time each of the workers has been created. If is more than 15 mins or if it does not exists. Create a new one.

Intended figuring out what other options will I have to identify if a worker is running. Could not find any.


