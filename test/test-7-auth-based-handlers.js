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

describe('Endpoint Role Handler', function() {
    describe('Basic', function() {
        var app, server;
        before(function(done) {
            app = express();
            app.use(cookieParser());
            var ops = {
                authenticator: function(req, res, next) {
                    return true;
                },
                authorizer: function(req, res, allowed) {
                    if (allowed === undefined) {
                        return true;
                    }
                    return allowed.indexOf(req.cookies.role) >= 0;
                },
                path: 'api',
                getTouch: [{
                    allow: 'member',
                    fun: function(req, res, next) {
                        res.status(200).send('member fun');
                        next();
                    }
                }, {
                    allow: 'member user',
                    fun: function(req, res, next) {
                        res.status(200).send('user fun');
                        next();
                    }
                }, {
                    fun: function(req, res, next) {
                        res.status(200).send('any fun');
                        next();
                    }
                }],
            };
            var r = new apiRouter(app, ops);
            r.passportAuth();
            server = app.listen(3000);
            done();
        });
        after(function(done) {
            server.close();
            done();
        });

        it('should run correct handler function', function(done) {
            var session = new Session();
            session.get('/api/touch')
                .set('cookie', 'role=member')
                .send({})
                .expect('member fun')
                .end(done);
        });
        it('should run any handler function when no role is met', function(done) {
            var session = new Session();
            session.get('/api/touch')
                .set('cookie', 'role=guest')
                .send({})
                .expect('any fun')
                .end(done);
        });
        it('should run any handler function for any user', function(done) {
            var session = new Session();
            session.get('/api/touch')
                .send({})
                .expect(200)
                .end(done);
        });
    });
    describe('Regression - no any handler', function() {
        var app, server;
        before(function(done) {
            app = express();
            app.use(cookieParser());
            var ops = {
                authenticator: function(req, res, next) {
                    return true;
                },
                authorizer: function(req, res, allowed) {
                    if (allowed === undefined) {
                        return true;
                    }
                    return allowed.indexOf(req.cookies.role) >= 0;
                },
                path: 'api',
                getTouch: [{
                    allow: 'member',
                    fun: function(req, res, next) {
                        res.status(200).send('member fun');
                        next();
                    }
                }, {
                    allow: 'member user',
                    fun: function(req, res, next) {
                        res.status(200).send('user fun');
                        next();
                    }
                }],
            };
            var r = new apiRouter(app, ops);
            r.passportAuth();
            server = app.listen(3000);
            done();
        });
        after(function(done) {
            server.close();
            done();
        });

        it('should run correct handler function', function(done) {
            var session = new Session();
            session.get('/api/touch')
                .set('cookie', 'role=member')
                .send({})
                .expect('member fun')
                .end(done);
        });
        it('should run any handler function when no role is met', function(done) {
            var session = new Session();
            session.get('/api/touch')
                .set('cookie', 'role=guest')
                .send({})
                .expect(404)
                .end(done);
        });
        it('should run any handler function for any user', function(done) {
            var session = new Session();
            session.get('/api/touch')
                .send({})
                .expect(404)
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
