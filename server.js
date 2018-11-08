//Import required packages

//Express => Fast, unopinionated, minimalist web framework for node.
const express = require('express'); 

//Cors => providing a Connect/Express middleware that can be used to enable CORS with various options.
const cors = require('cors'); 

//Body-parse => Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
const bodyParser = require('body-parser');

//Errorhandler => This middleware is only intended to be used in a development environment, as the full error stack traces and internal details of any object passed to this module will be sent back to the client when an error occurs.
const errorhandler = require('errorhandler');

//Morgan - HTTP request logger middleware for node.js
const morgan = require('morgan');

//Creating express app
const app = express();

//middleware functions for all routes
app.use(bodyParser.json());
app.use(cors());
app.use(errorhandler());
app.use(morgan('dev'));

//Creating apiRouter
const apiRouter = require('./api/api.js');
app.use('/api', apiRouter);



//Setting PORT for server to listen
const PORT = process.env.PORT || 4000;

//Start server listening to PORT
app.listen(PORT, () => {
  console.log('Listening on port: ' + PORT);
});

//Export app
module.exports = app;