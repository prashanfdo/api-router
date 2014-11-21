'use strict';
//node-debug C:\Users\prashanf\AppData\Roaming\npm\node_modules\grunt-cli\bin\grunt default
var inlineParser = require('../lib/ops-parser.js');
var should = require('should');


describe('Inline parser', function() {
    var sampleAuthFun = function() {};
    var sampleAuthorizeFun = function() {};
    var sampleHandlerFun = function() {};
    var sampleAuthFun1 = function() {};
    var sampleAuthorizeFun1 = function() {};
    var sampleHandlerFun1 = function() {};
    var sampleHandlerFun2 = function() {};
    var sampleHandlerFun3 = function() {};
    var sampleHandlerFun4 = function() {};
    describe('Basics', function(done) {
        it("verb only methods", function() {
            //primitive ops
            var ops = {
                'get': {
                    anything: 'goes here'
                }
            };
            inlineParser.parse(ops);
            (ops).should.containDeep({
                methodCollection: [{
                    verb: 'get',
                    anything: 'goes here'
                }]
            });
            //least ops
            ops = {
                'get': sampleHandlerFun
            };
            inlineParser.parse(ops);
            (ops).should.containDeep({
                methodCollection: [{
                    verb: 'get',
                    handlerCollection: [{
                        allow: '*',
                        handler: sampleHandlerFun
                    }]
                }]
            });
        });
        it('methods with verb and path - eg. "getUsers"', function() {
            //primitive ops
            var ops = {
                'getUsers': {
                    anything: 'goes here'
                }
            };
            inlineParser.parse(ops);
            ops.should.containDeep({
                routeCollection: [{
                    path: 'Users',
                    methodCollection: [{
                        verb: 'get',
                        anything: 'goes here'
                    }]
                }]
            });
            //least ops
            ops = {
                getUsers: sampleHandlerFun
            };
            inlineParser.parse(ops);
            ops.should.containDeep({
                routeCollection: [{
                    path: 'Users',
                    methodCollection: [{
                        verb: 'get',
                        handlerCollection: [{
                            allow: '*',
                            handler: sampleHandlerFun
                        }]
                    }]
                }]
            });
        });
    });
});
