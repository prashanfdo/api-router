'use strict';
//node-debug C:\Users\prashanf\AppData\Roaming\npm\node_modules\grunt-cli\bin\grunt default
var inlineParser = require('../lib/ops-parser.js');
var should = require('should');

describe('Model parser', function() {
    var sampleAuthFun = function() {};
    var sampleAuthorizeFun = function() {};
    var sampleHandlerFun = function() {};
    var sampleAuthFun1 = function() {};
    var sampleAuthorizeFun1 = function() {};
    var sampleHandlerFun1 = function() {};
    var sampleHandlerFun2 = function() {};
    var sampleHandlerFun3 = function() {};
    var sampleHandlerFun4 = function() {};
    var sampleModel = {};
    describe('Basics', function(done) {
        it("primitives ops works", function() {
            //primitive ops
            var ops = {
                path: 'api',
                modelCollection: [{
                    path: 'things',
                    model: sampleModel,
                }]
            };
            inlineParser.parse(ops);
            ops.should.containDeep({
                routeCollection: [{
                    path: 'things',
                    methodCollection: [{
                        verb: 'get',
                        anonymous: false,
                        handlerCollection: [{
                            allow: '*'
                        }]
                    }, {
                        verb: 'post',
                        handlerCollection: [{
                            allow: '*'
                        }]
                    }],
                    routeCollection: [{
                        path: ':id',
                        url: '/api/things/:id',
                        methodCollection: [{
                            verb: 'get',
                            anonymous: false,
                            handlerCollection: [{
                                allow: '*'
                            }]
                        }, {
                            verb: 'put',
                            anonymous: false,
                            handlerCollection: [{
                                allow: '*'
                            }]
                        }, {
                            verb: 'delete',
                            anonymous: false,
                            handlerCollection: [{
                                allow: '*'
                            }]
                        }]
                    }]
                }]
            });
        });
        it("override model methods accessibility", function() {
            //primitive ops
            var ops = {
                path: 'api',
                modelCollection: [{
                    path: 'things',
                    model: sampleModel,
                    methods: {
                        index: {
                            allow: 'members'
                        }
                    }
                }]
            };
            inlineParser.parse(ops);
            ops.should.containDeep({
                routeCollection: [{
                    path: 'things',
                    methodCollection: [{
                        verb: 'get',
                        anonymous: false,
                        handlerCollection: [{
                            allow: 'members'
                        }]
                    }]
                }]
            });
        }); 
        it("override model methods handler", function() {
            //primitive ops
            var ops = {
                path: 'api',
                modelCollection: [{
                    path: 'things',
                    model: sampleModel,
                    methods: {
                        index: {
                            handler:sampleHandlerFun
                        }
                    }
                }]
            };
            inlineParser.parse(ops);
            ops.should.containDeep({
                routeCollection: [{
                    path: 'things',
                    methodCollection: [{
                        verb: 'get',
                        anonymous: false,
                        handlerCollection: [{
                            handler:sampleHandlerFun
                        }]
                    }]
                }]
            });
        });
    });
});
