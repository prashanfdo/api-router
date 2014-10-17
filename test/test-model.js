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
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var db = require('./test-db.js');

var thingsModel = mongoose.model('Thing');


describe('api-router', function() {
    describe('Model routing', function() {
        var app, server,things;
        before(function(done) {
            app = express();
            app.use(bodyParser.json());
            var ops = {
                authenticator: function(req, res, next) {
                    return true;
                },
                authorizer: function(req, res, next) {
                    return true;
                },
                path: 'api',
                get: return200,
                models:[{
                    path:'thing',
                    model:thingsModel,
                },],
            };
            apiRouter(app, ops);
            server = app.listen(3000); 
            db.seedThings(function  () {
                thingsModel.find(function (err, result) {
                    things = result; 
                    done();
                });                
            });
        });
        after(function(done) {
            server.close();
            done();
        });
        describe('basic routing', function() { 
            var that = this;
            test('get', '/api/thing',function  (res) {
                if(JSON.stringify(res.body) !== JSON.stringify(things))
                    return 'Failed';
            });
            var createObj;
            it('POST\t/api/thing',function  (done) { 
                var req = request('localhost:3000').post('/api/thing')
                    .set('Accept', 'application/json'); 
                    req.send({name:'X',info:'XX'}); 
                req.expect(201)
                .end(function  (err,res,body) {
                    createObj = res.body; 
                    done();
                });
            });
            it('GET\t/api/thing/:id',function  (done) { 
                var req = request('localhost:3000').get('/api/thing/'+createObj._id)
                    .set('Accept', 'application/json'); 
                    req.send(); 
                req.expect(200)
                .end(function  (err,res,body) {  
                    done();
                });
            });
            it('PUT\t/api/thing/:id',function  (done) { 
                var req = request('localhost:3000').put('/api/thing/'+createObj._id)
                    .set('Accept', 'application/json'); 
                    req.send({name:'Y'});
                req.expect(function  (res) { 
                    return (res.body.name === 'Y');
                })
                .end(function  (err,res,body) {  
                    done();
                });
            });
            it('DELETE\t/api/thing/:id',function  (done) { 
                var req = request('localhost:3000').put('/api/thing/'+createObj._id)
                    .set('Accept', 'application/json'); 
                    req.send();
                req.expect(200)
                .end(function  (err,res,body) {  
                    done();
                });
            });


            // test('get', function  () {
            //     return ['/api/thing/:id',things && ('/api/thing/' + things[0].id) || undefined];
            // },function  (res) {  
            //     if(JSON.stringify(res.body) !== JSON.stringify(things[0])) return 'Failed';
            // });
            // test('delete', function  () {
            //     return ['/api/thing/:id',things && ('/api/thing/' + things[0].id) || undefined];
            // },204); 
        });
    });
});

function return200(req, res) {
    res.status(200).send({
        hello: 'world'
    });
}

function test(verb, url, test, reqOverride,data) { 
    var urlName = url;
    if(typeof(url) === 'function'){
        urlName = url()[0];
    }
    it(verb.toUpperCase() + ' ' + urlName, function(done) {
        if(typeof(url) === 'function'){
            url = url()[1]; 
        }
        var req = request('localhost:3000')[verb](url)
            .set('Accept', 'application/json');
        if(data)
            req.send(data);
        if (reqOverride) {
            reqOverride(req);
        }
        req.expect(test || 200)
        .end(done);
    });
}
