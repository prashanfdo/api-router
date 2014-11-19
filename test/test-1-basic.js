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
                url: '/api',
                methodCollection: [{
                    authenticator: function(req, res, next) {
                        return true;
                    },
                    authorizer: function(req, res, next) {
                        return true;
                    },
                    allow: '*',
                    verb: 'get',
                    handlers: [{
                        allow: '*',
                        handler: send('ok')
                    }]
                }, {
                    authenticator: function(req, res, next) {
                        return true;
                    },
                    authorizer: function(req, res, next) {
                        return true;
                    },
                    allow: '*',
                    verb: 'post',
                    handlers: [{
                        allow: '*',
                        handler: send('ok')
                    }]
                }],
                routeCollection: [{
                    authenticator: function(req, res, next) {
                        return true;
                    },
                    authorizer: function(req, res, next) {
                        return true;
                    },
                    url: '/api/nestedurl',
                    methodCollection: [{
                        authenticator: function(req, res, next) {
                            return true;
                        },
                        authorizer: function(req, res, next) {
                            return true;
                        },
                        allow: '*',
                        verb: 'get',
                        handlers: [{
                            allow: '*',
                            handler: send('ok')
                        }]
                    }],
                    routeCollection: [{
                        authenticator: function(req, res, next) {
                            return true;
                        },
                        authorizer: function(req, res, next) {
                            return true;
                        },
                        url: '/api/nestedurl',
                        methodCollection: [{
                            authenticator: function(req, res, next) {
                                return true;
                            },
                            authorizer: function(req, res, next) {
                                return true;
                            },
                            allow: '*',
                            verb: 'get',
                            handlers: [{
                                allow: '*',
                                handler: send('ok')
                            }]
                        }],
                        routeCollection: [{
                            authenticator: function(req, res, next) {
                                return true;
                            },
                            authorizer: function(req, res, next) {
                                return true;
                            },
                            url: '/api/nestedurl',
                            methodCollection: [{
                                authenticator: function(req, res, next) {
                                    return true;
                                },
                                authorizer: function(req, res, next) {
                                    return true;
                                },
                                allow: '*',
                                verb: 'get',
                                handlers: [{
                                    allow: '*',
                                    handler: send('ok')
                                }]
                            }],
                            routeCollection: [{
                                authenticator: function(req, res, next) {
                                    return true;
                                },
                                authorizer: function(req, res, next) {
                                    return true;
                                },
                                url: '/api/very-long-url',
                                methodCollection: [{
                                    authenticator: function(req, res, next) {
                                        return true;
                                    },
                                    authorizer: function(req, res, next) {
                                        return true;
                                    },
                                    allow: '*',
                                    verb: 'get',
                                    handlers: [{
                                        allow: '*',
                                        handler: send('ok')
                                    }]
                                }],
                                routeCollection: []
                            }]
                        }]
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
            test('get', '/fakeurl', 404);
            test('get', '/api/very-long-url');
        });
    });
});

function send(obj, status) {
    status = status || 200;
    obj = obj || {};
    return function(req, res, next) {
        res.status(status).send(obj);
        next();
    };
}

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
