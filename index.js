const express = require('express');
const jsonServer = require('json-server');
const fileName = process.argv[2] || './data.js';
const data = fileName.endsWith('.js') ? require(fileName) : fileName;
const port = process.argv[3] || 40400;

const app = express();
const router = jsonServer.router(data);
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
app.use(middlewares);

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
app.use(jsonServer.bodyParser);

app.use('/api', router);

app.listen(port, () => console.log(`Fake Product API: http://localhost:${port}/api/db`));
