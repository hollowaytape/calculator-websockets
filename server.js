'use strict';

var express = require('express');
var expressWs = require('express-ws');
var mongo = require('mongodb').MongoClient;
var routes = require('./app/routes/index.js');
var bodyParser = require('body-parser');

var app = express();

const PORT = process.env.PORT || 3000;
const DB_STRING = process.env.DB_CONNECTION_STRING;

// Setup websockets
expressWs(app);
const connections = new Set();
function wsHandler(ws) {
	connections.add(ws);

	ws.on('message', (message) => {
		connections.forEach((conn) => conn.send(message));
	});

	ws.on('close', () => {
		connections.delete(ws);
	})
}

app.set('view engine', 'pug')

app.use(bodyParser.json())


mongo.connect(DB_STRING, function (err, database) {
   if (err) {
      throw new Error('Database failed to connect!');
   } else {
      console.log('Successfully connected to MongoDB on port 27017.');
   }

   const db = database.db('clementine');

   app.use('/public', express.static(process.cwd() + '/public'));
   app.use('/controllers', express.static(process.cwd() + '/app/controllers'));

   routes(app, db);

   app.listen(PORT, function () {
      console.log('Node.js listening on port 3000...');
   });

});
