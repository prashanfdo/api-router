'use strict';
//node-debug C:\Users\prashanf\AppData\Roaming\npm\node_modules\grunt-cli\bin\grunt default
var apiRouter = require('../lib/api-router.js');
var should = require('should');
var assert = require('assert');
var request = require('supertest');
var express = require('express');
var apiRouter = require('../lib/api-router.js');
var Session = require('supertest-session')({
    app: 'localhost:3000'
});
var cookieParser = require('cookie-parser'); 
var mongoose = require('mongoose');
require('./test-db.js');

describe('api-router', function() {
    describe('Model routing', function() {
        var app, server;
        before(function(done) {
            app = express();
            var thingsModel = mongoose.model('Thing');
            var ops = {
                authResolver: function(req, res, next) {
                    return true;
                },
                authorizationResolver: function(req, res, next) {
                    return true;
                },
                url: 'api',
                get: return200,
                model:thingsModel,
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
            test('post', '/api/things',function  (res) {
                if(!('id' in res.body)) return 'Failed';
            });
            // test('get', '/api/meta');
            // test('post', '/api/meta');
            // test('get', '/api/user');
            // test('post', '/api/user/user');
            // test('post', '/api/user/admin/create');

        });
    });
});

function return200(req, res) {
    res.status(200).send({
        hello: 'world'
    });
}

function test(verb, url, test, reqOverride) {
    it(verb.toUpperCase() + ' ' + url, function(done) {
        var req = request('localhost:3000')[verb](url)
            .set('Accept', 'application/json');
        if (reqOverride) {
            reqOverride(req);
        }
        req.expect(test || 200)
        .end(done);
    });
}
