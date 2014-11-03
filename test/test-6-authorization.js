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


describe('Authorization', function() {
    describe('Basic', function() {
        var app, server;
        before(function(done) {
            app = express();
            app.use(cookieParser());
            var ops = {
                authenticator: function(req, res) {
                    return true;
                },
                authorizer: function(req, res, allowed) {
                    if (allowed === undefined) {
                        return true;
                    }
                    return allowed.indexOf(req.cookies.role) >= 0;
                },
                path: 'api',
                allow: 'user',
                getTouch: function(req, res, next) {
                    res.status(200).send();
                    next();
                },
                routes: [{
                    path: 'admin',
                    allow: 'admin manager',
                    getManagerTouch: function(req, res, next) {
                        res.status(200).send();
                        next();
                    }
                }]
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
        it('should allow specified role', function(done) {
            var session = new Session();
            session.get('/api/touch')
                .set('cookie', 'role=user')
                .send({})
                .expect(200)
                .end(done);
        });
        it('should not allow un-specified role', function(done) {
            var session = new Session();
            session.get('/api/touch')
                .set('cookie', 'role=guest')
                .send({})
                .expect(403)
                .end(done);
        });
        it('should not allow empty role', function(done) {
            var session = new Session();
            session.get('/api/touch')
                .send({})
                .expect(403)
                .end(done);
        });
        it('should allow from multiple allowed roles', function(done) {
            var session = new Session();
            session.get('/api/admin/managertouch')
                .set('cookie', 'role=manager')
                .send({})
                .expect(200)
                .end(done);
        });
    });

});