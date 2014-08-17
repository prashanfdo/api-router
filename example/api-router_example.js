'use strict';
var express = require('express');
var app = express();
var apiRouter = require('../lib/api-router.js'); 
debugger;

var ops = {
    url: 'api',
    anonymous: true,
    get: function(req, res) {
        res.end('hello');
    }
};
apiRouter(app, ops);
app.listen(3000);
console.log('Server Started!');