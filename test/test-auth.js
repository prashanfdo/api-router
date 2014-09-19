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


describe('api-router', function() {
    describe('Authed Routing', function() {
        var app, server;
        before(function(done) {
            app = express();
            app.use(cookieParser());
            var ops = {
                authenticator: function(req, res, next) { 
                        return !!req.cookies.user;
                },
                authorizer: function(req, res, next) {
                    return true;
                },
                path: 'api',
                get: return200,
                getTouch: function(req, res, next) { 
                    res.status(200).send();
                    next();
                },
                routes: [{
                    path: 'signin',
                    anonymous: true,
                    post: function(req, res, next) {
                        res
                            .cookie('user', '123456')
                            .status(200).send({
                                hello: 'world'
                            });
                        next();
                    }
                }]
            };
            var r = new apiRouter(app, ops);
            r.passportAuth();
            server = app.listen(3000);
            this.authedSession = new Session();
            done();
        });
        after(function(done) {
            server.close();
            this.authedSession.destroy();
            done();
        });

        it('should sign in user', function(done) {
            this.authedSession.post('/api/signin')
                .send({
                    username: 'admin',
                    password: 'admin'
                })
                .expect(200)
                .end(done);
        });
        it('should touch signed user', function(done) {
            this.authedSession.get('/api/touch')
                .send({})
                .expect(200)
                .end(done);
        });
        it('shouldn\'t touch anonymous users', function(done) {
            new Session().get('/api/touch')
                .send({})
                .expect(401)
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
