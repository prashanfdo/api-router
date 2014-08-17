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
                authResolver: function(req, res, next) {
                    return true;
                },
                authorizationResolver: function(req, res, next) {
                    return true;
                },
                url: 'api',
                get: return200,
                post: return200,
                getMeta: {
                    anonymous: true,
                    method: return200
                },
                postMeta: return200,
                routes: [{
                    url: 'user',
                    get: return200,
                    postUser: return200,
                    routes: [{
                        url: 'admin',
                        postCreate: return200
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
            test('post', '/api');
            test('get', '/api/meta');
            test('post', '/api/meta');
            test('get', '/api/user');
            test('post', '/api/user/user');
            test('post', '/api/user/admin/create');

        });
    });
    describe('Authed Routing', function() {
        var app, server;
        before(function(done) {
            app = express();
            var ops = {
                authResolver: function(req, res, next) {
                    console.log(req.cookies, 'asd');
                    return true;
                },
                authorizationResolver: function(req, res, next) {
                    return true;
                },
                url: 'api',
                get: return200,
                routes:[{
                    url:'signin',
                    post:function  (req,res,next) {
                        console.log(text)
                         res.status(200).send({
                            hello: 'world'
                        });
                        next();
                    }
                }]
            };
            apiRouter(app, ops);
            server = app.listen(3000);
            this.session = new Session();
            done();
        });
        after(function(done) {
            server.close();
            this.sesson.destroy();
            done();
        });

        it('should sign in user', function(done) {
            this.sess.post('/api/signin')
                .send({
                    username: 'admin',
                    password: 'admin'
                })
                .expect(200)
                .end(done);
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
