'use strict';
//node-debug C:\Users\prashanf\AppData\Roaming\npm\node_modules\grunt-cli\bin\grunt default
var inlineParser = require('../lib/ops-parser.js');
var should = require('should');


describe('Parser', function() {
    var sampleAuthFun = function() {};
    var sampleAuthorizeFun = function() {};
    var sampleHandlerFun = function() {};
    var sampleAuthFun1 = function() {};
    var sampleAuthorizeFun1 = function() {};
    var sampleHandlerFun1 = function() {};
    describe('Routes', function(done) {
        it("Basic ops", function() {
            //primitive ops
            var ops = {
                url: 'api',
                allow: '*',
                anonymous: false,
                authenticator: sampleAuthFun,
                authorizer: sampleAuthorizeFun,
                methodCollection: [],
                routeCollection: []
            };
            inlineParser.parse(ops);
            (ops).should.containDeep({
                url: 'api',
                allow: '*',
                authenticator: sampleAuthFun,
                authorizer: sampleAuthorizeFun,
                methodCollection: [],
                routeCollection: []
            });
            //least ops
            ops = {
                path: 'api'
            };
            inlineParser.parse(ops);
            (ops).should.containDeep({
                url: 'api',
                allow: '*',
                methodCollection: [],
                routeCollection: []
            });
            ops.authenticator().should.be.true;
            ops.authorizer().should.be.true;
        });
        it("Nested and object routes", function() {
            //least ops
            var ops = {
                path: 'api',
                routes: {
                    'user': {
                        allow: '*'
                    }
                }
            };
            inlineParser.parse(ops);
            ops.should.containDeep({
                path: 'api',
                parent: {
                    allow: '*',
                    anonymous: false,
                    url: ''
                },
                allow: '*',
                anonymous: false,
                methodCollection: [],
                routeCollection: [{
                    allow: '*',
                    path: 'user',
                    anonymous: false,
                    methodCollection: [],
                    routeCollection: [],
                    url: '/api/user'
                }],
                url: '/api'
            });
        });
    });
    describe('Methods', function(done) {
        it("Basic ops", function() {
            //primitive ops
            var ops = {
                url: 'api',
                allow: '*',
                anonymous: false,
                authenticator: sampleAuthFun,
                authorizer: sampleAuthorizeFun,
                methodCollection: [],
                routeCollection: []
            };
            inlineParser.parse(ops);
            (ops).should.containDeep({
                url: 'api',
                allow: '*',
                authenticator: sampleAuthFun,
                authorizer: sampleAuthorizeFun,
                methodCollection: [],
                routeCollection: []
            });
            //inheriting parent defaults
            ops = {
                authenticator: sampleAuthFun,
                authorizer: sampleAuthorizeFun,
                path: 'api',
                allow: 'users admin',
                methodCollection: [{
                    verb: 'get',
                    allow: 'admin',
                    handler: sampleHandlerFun
                }, {
                    verb: 'post',
                    authenticator: sampleAuthFun1,
                    authorizer: sampleAuthorizeFun1,
                    handler: sampleHandlerFun1
                }]
            };
            inlineParser.parse(ops);
            ops.methodCollection.should.containDeep([{
                verb: 'get',
                allow: 'admin',
                authenticator: sampleAuthFun,
                authorizer: sampleAuthorizeFun,
                handler: sampleHandlerFun
            }, {
                verb: 'post',
                allow: 'users admin',
                authenticator: sampleAuthFun1,
                authorizer: sampleAuthorizeFun1,
                handler: sampleHandlerFun1
            }]);
            //route.methods arrys copies to route.methodCollection
            ops = {
                path: 'api',
                methods: [{
                    verb: 'get',
                    allow: 'admin',
                    authenticator: sampleAuthFun,
                    authorizer: sampleAuthorizeFun,
                    handler: sampleHandlerFun
                }, {
                    verb: 'post',
                    allow: 'users admin',
                    authenticator: sampleAuthFun1,
                    authorizer: sampleAuthorizeFun1,
                    handler: sampleHandlerFun1
                }]
            };
            inlineParser.parse(ops);
            ops.methodCollection.should.containDeep([{
                verb: 'get',
                allow: 'admin',
                authenticator: sampleAuthFun,
                authorizer: sampleAuthorizeFun,
                handler: sampleHandlerFun
            }, {
                verb: 'post',
                allow: 'users admin',
                authenticator: sampleAuthFun1,
                authorizer: sampleAuthorizeFun1,
                handler: sampleHandlerFun1
            }]);
            //route.methods short hand works
            // methods:{
            //     get:function
            // }
            ops = {
                methods: {
                    post: {
                        allow: 'user',
                        handlers: []
                    },
                    get: sampleHandlerFun,
                }
            };
            inlineParser.parse(ops);
            ops.methodCollection.should.containDeep([{
                verb: 'post',
                allow: 'user'
            }, {
                verb: 'get'
            }, ]);
        });
    });
    describe('Handlers', function(done) {
        it("Basic ops", function() {
            //all ops
            var ops = {
                methodCollection: [{
                    handlerCollection: [{
                        allow: 'user',
                        handler: sampleHandlerFun
                    }, {
                        allow: '*',
                        handler: sampleHandlerFun1
                    }]
                }]
            };
            inlineParser.parse(ops);
            ops.should.containDeep({
                methodCollection: [{
                    handlerCollection: [{
                        allow: 'user',
                        handler: sampleHandlerFun
                    }, {
                        allow: '*',
                        handler: sampleHandlerFun1
                    }]
                }]
            });
            //shorthand ops - handlers:[] -> handlerCollection:[]
            var ops = {
                methodCollection: [{
                    handlers: [{
                        allow: 'user',
                        handler: sampleHandlerFun
                    }, {
                        allow: '*',
                        handler: sampleHandlerFun
                    }]
                }]
            };
            inlineParser.parse(ops);
            ops.should.containDeep({
                methodCollection: [{
                    handlerCollection: [{
                        allow: 'user',
                        handler: sampleHandlerFun
                    }, {
                        allow: '*',
                        handler: sampleHandlerFun
                    }]
                }]
            });
            //shorthand ops - handlers:{} -> handlerCollection:[]
            var ops = {
                methodCollection: [{
                    handlers:{
                        'user':{
                            handler:sampleHandlerFun
                        },
                        '*':{
                            handler:sampleHandlerFun1
                        }
                    }
                }]
            };
            inlineParser.parse(ops);
            ops.should.containDeep({
                methodCollection: [{
                    handlerCollection: [{
                        allow: 'user',
                        handler: sampleHandlerFun
                    }, {
                        allow: '*',
                        handler: sampleHandlerFun1
                    }]
                }]
            });
        });
    });
});
