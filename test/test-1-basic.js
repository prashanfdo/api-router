'use strict';
//node-debug C:\Users\prashanf\AppData\Roaming\npm\node_modules\grunt-cli\bin\grunt default
var apiRouter = require('../lib/api-router.js');
var should = require('should');
var assert = require('assert');
var request = require('supertest');
var express = require('express');
var apiRouter = require('../lib/api-router.js');
var Session = require('supertest-session')({app:'localhost:3000'});


describe('api-router', function() {
    describe('Basics', function() {
        var app, server;
        before(function(done) {
            app = express();
            var ops = {
                authenticator: function(req, res, next) {
                    return true;
                },
                authorizer: function(req, res, next) {
                    return true;
                },
                path: 'api',
                get: return200,
                'get:id': return200,
                post: {fun:return200},
                getMeta:return200,
                methods:[],
                routes: [{
                    path: 'user',  
                    getAllUsers:return200,
                    routes: [{
                        path: 'admin',
                        get: {fun:return200},
                    }]
                }]
            }; 
            apiRouter(app, ops);
            server = app.listen(3000);
            done();
        });
        after(function(done) {
            server.close();
            done();
        });
        describe('routing', function() {
            test('get', '/api');
            test('get', '/api/123');
            test('get', '/api/meta');  
            test('get', '/api/user');  
            test('get', '/api/user/AllUsers');
            test('get', '/api/user/AllUsersX',404);
        });
    });
});

function return200(req, res) {
    res.status(200).send({
        hello: 'world'
    });
}

function test(verb, url, status, reqOverride) {
    it(verb.toUpperCase() + ' ' + url, function(done) {
        var req = request('localhost:3000')[verb](url)
            .set('Accept', 'application/json')
            .set('Cookie', 'myApp-token=12345667');
        if (reqOverride) {
            reqOverride(req);
        }
        req.expect(status || 200, done);
    });
}
