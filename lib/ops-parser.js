/*
 * api-router
 * https://github.com/Prashanfdo/api-router
 *
 * Copyright (c) 2014 Prashan Fernando
 * Licensed under the MIT license.
 */

'use strict';
var changeCase = require('change-case');
var _ = require('lodash');
var utils = require('./utils.js');

module.exports = {
    parseInlines: parseInlines,
    parseModels: parseModels,
    parse: parse
};

//tree
//route 
//  method
//      handlers

function parse(ops) {
    ops.parent = {
        authenticator: utils.getPassThroughFun('authenticator'),
        authorizer: utils.getPassThroughFun('authorizer'),
        allow: '*',
        anonymous: false,
        url: ''
    };
    parseRoute(ops);
}

function parseRoute(routeOps) {
    utils.defaults(routeOps, {
        authenticator: routeOps.parent.authenticator,
        authorizer: routeOps.parent.authorizer,
        allow: routeOps.parent.allow,
        anonymous: routeOps.parent.anonymous,
        methodCollection: [],
        routeCollection: [],
        modelCollection: []
    });
    //todo-validations - path mandotory
    //decorators
    //core parsing
    if (routeOps.path) {
        routeOps.url = routeOps.parent.url + '/' + routeOps.path;
    }

    parseInlineMethods(routeOps);
    //models
    if (routeOps.models) {
        if (_.isPlainObject(routeOps.models)) {
            //route:{} -> []
            // route:{
            //     user:{
            //         path:'users'
            //     }
            // }
            var tempModels = [];
            _.forIn(routeOps.models, function(val, key) {
                var modelOps = resolveShortHandOps('model', val);
                utils.defaults(modelOps, {
                    path: key,
                });
                tempModels.push(modelOps);
            });
            routeOps.models = tempModels;
        }
        if (_.isArray(routeOps.models)) {
            //route:[] -> routeCollection
            _.forEach(routeOps.models, function(route) {
                routeOps.modelCollection.push(route);
            });
        }
    }
    if (routeOps.modelCollection) {
        routeOps.modelCollection.forEach(function(ops) {
            parseModel(ops, routeOps);
        });
    }
    if (routeOps.routes) {
        if (_.isPlainObject(routeOps.routes)) {
            //route:{} -> []
            // route:{
            //     user:{
            //         path:'users'
            //     }
            // }
            var tempRoutes = [];
            _.forIn(routeOps.routes, function(val, key) {
                utils.defaults(val, {
                    path: key,
                });
                tempRoutes.push(val);
            });
            routeOps.routes = tempRoutes;
        }
        if (_.isArray(routeOps.routes)) {
            //route:[] -> routeCollection
            _.forEach(routeOps.routes, function(route) {
                routeOps.routeCollection.push(route);
            });
        }
    }
    if (routeOps.methods) {
        if (_.isPlainObject(routeOps.methods)) {
            //methods:{} -> []
            // methods:{
            //     get:{
            //         allow:'user', handler: fun(){}
            //     }
            // }
            var tempMethods = [];
            _.forIn(routeOps.methods, function(val, key) {
                utils.error(!val, 'value of ' + key + ' not defined');
                val = parseMethod(val, routeOps);
                val.verb = key;
                tempMethods.push(val);
            });
            routeOps.methods = tempMethods;
        }
        if (_.isArray(routeOps.methods)) {
            //method:[] -> methodCollection
            _.forEach(routeOps.methods, function(method) {
                routeOps.methodCollection.push(method);
            });
        }
    }
    routeOps.methodCollection.forEach(function(ops) {
        parseMethod(ops, routeOps);
    });
    routeOps.routeCollection.forEach(function(ops) {
        ops.parent = routeOps;
        parseRoute(ops);
    });
}

function parseMethod(methodOps, parent) {
    if (_.isFunction(methodOps)) {
        methodOps = {
            handlers: methodOps
        };
    }
    if (methodOps.handlers) {
        if (_.isFunction(methodOps.handlers)) {
            methodOps.handlers = {
                '*': {
                    handler: methodOps.handlers
                }
            };
        }
        if (_.isPlainObject(methodOps.handlers)) {
            //handlers:{} -> []
            // handlers:{
            //     user:{
            //         handler: fun(){}
            //     }
            // }
            var tempMethods = [];
            _.forIn(methodOps.handlers, function(val, key) {
                val = parseHandler(val, methodOps);
                val.allow = key;
                tempMethods.push(val);
            });
            methodOps.handlers = tempMethods;
        }
    }
    //defaults 
    methodOps = utils.defaults(methodOps, {
        handlerCollection: []
    });
    if (_.isArray(methodOps.handlers)) {
        //method:[] -> methodCollection
        _.forEach(methodOps.handlers, function(method) {
            methodOps.handlerCollection.push(method);
        });
    }
    //parent defaults
    if (parent) {
        utils.defaults(methodOps, {
            parent: parent,
            authenticator: parent.authenticator,
            authorizer: parent.authorizer,
            allow: parent.allow,
            anonymous: parent.anonymous
        });
    }
    methodOps.handlerCollection.forEach(function(ops) {
        ops.parent = methodOps;
        parseHandler(ops);
    });
    return methodOps;
}

function parseHandler(handlerOps, parent) {
    //core parsing
    utils.defaults(handlerOps, {});
    return handlerOps;
}

function parseInlineMethods(route) {
    // {
    //     'get':{}
    // }
    // -->
    // {
    //     methods:{
    //         get:{}
    //     }
    // }
    route.methods = route.methods || {};
    route.routes = route.routes || {};
    _.forIn(route, function(val, key) {
        var matches = key.match(/^(get|post|put|delete)(.*)$/);
        if (matches != null && matches.length === 3) {
            if (matches[2] === '') {
                route.methods[matches[1]] = val;
            } else {
                route.routes[matches[2]] = {
                    methods: {}
                };
                route.routes[matches[2]].methods[matches[1]] = val;
            }
        }else if(key.indexOf('model') === 0 && key !== 'model' && key !== 'models' && key !== 'modelCollection'){
            //inline models
            var modelName = key.substring(5,1000);
            route.models = route.models || {};
            route.models[modelName] = val;
        }
    });
    return route;
}

function parseModel(modelOps, routeOps) {
    utils.defaults(modelOps, {
        methods: []
    });
    //modelOps = parseModelShortHands(modelOps,routeOps);

    // {
    //     authenticator:,
    //     authorizer:,
    //     path: 'things',
    //     model: sampleModel,
    //     methods:{
    //         index:[{
    //             allow:'users',
    //             handler:sampleHandlerFun
    //         },{
    //             allow:'admin',
    //             handler:sampleHandlerFun1
    //         }]
    //     }
    // }
    // -->
    // routeCollection: [{
    //     path: 'things',
    //     methodCollection:[]
    // }]
    parseModelShortHands(modelOps, routeOps);
    parseModelToRoutes(modelOps, routeOps);
}

function parseModelShortHands(modelOps, routeOps) {
    var baseRoute = modelOps.parent;
    if (_.isString(modelOps)) {
        if (/\w+/.test(modelOps)) {
            utils.error('invalid model name' + modelOps);
        } else {
            modelOps = {
                path: modelOps,
                model: modelOps
            };
        }
    }
    if (_.isString(modelOps.model)) {
        modelOps.model = getMongooseModel(modelOps.model);
    }
    if (!modelOps.model) {
        throw Error('Invalid args:model property undefined');
    }
    // if (modelOps.model.prototype.constructor.name !== 'model') {
    //     throw Error('Invalid args:model is not a mongoose model instance');
    // }
    // if (!modelOps.path) {
    //     modelOps.path = modelOps.model.collection.collection.collectionName;
    // }
    if (!/[a-z]+/i.test(modelOps.path)) {
        throw Error('Invalid path for mongoose model');
    }
    var modelBinds = getModelBinds(modelOps.model);
    modelOps.methods = modelOps.methods || {};
    ['index', 'create', 'show', 'update', 'destroy'].forEach(function(method) {
        if (!modelOps.methods[method]) {
            modelOps.methods[method] = {
                handlerCollection: [{
                    allow: '*',
                    handler: modelBinds[method]
                }]
            };
        } else if (_.isPlainObject(modelOps.methods[method])) {
            utils.defaults(modelOps.methods[method], {
                handler: modelBinds[method]
            });
            modelOps.methods[method] = {
                handlerCollection: [modelOps.methods[method]]
            };
        }
    });
    return modelOps;
}

function parseModelToRoutes(modelOps, routeOps) {
    // var modelOps = {
    //     authenticator:
    //     authorizer:
    //     path:'things',
    //     model:ThingsModel | 'Things',
    //     index/create/show/update:'user manager admin' | function() {} | {
    //         allow:'user manager admin',
    //         anonymous:true,
    //         handler:function(){}
    //     },
    //     postUpdateIndex:function(){};
    // }
    routeOps.routes = routeOps.routes || {};
    var modelBaseRoute = {
        methods: {
            get: modelOps.methods.index,
            post: modelOps.methods.create
        },
        routes: {
            ':id': {
                methods: {
                    get: modelOps.methods.show,
                    put: modelOps.methods.update,
                    'delete': modelOps.methods.destroy,
                }
            }
        }
    };
    routeOps.routes[modelOps.path] = modelBaseRoute;
}

//old 
function parseInlines(ops) {
    for (var prop in ops) {
        var matches = prop.match(/^(get|post|delete|put)([^\/]*)?$/i);
        if (matches !== null) {
            var propOps = ops[prop];
            if (!matches[2])
                parseInlineMethod(ops, matches, propOps);
            else
                parseInlineRoute(ops, matches, propOps);
            delete ops[prop];
        }
    }
}

function parseModels(ops) {
    ops.models = ops.models || [];
    ops.routes = ops.routes || [];
    _.forEach(ops.models, function(modelOps) {
        if (_.isString(modelOps)) {
            modelOps = {
                path: modelOps,
                model: modelOps
            };
        }
        if (_.isString(modelOps.model)) {
            modelOps.model = getMongooseModel(modelOps.model);
        }
        if (!modelOps.model) {
            throw Error('Invalid args:model property undefined');
        }
        // if (modelOps.model.prototype.constructor.name !== 'model') {
        //     throw Error('Invalid args:model is not a mongoose model instance');
        // }
        if (!modelOps.path) {
            modelOps.path = modelOps.model.collection.collection.collectionName;
        }
        if (!/[a-z]+/i.test(modelOps.path)) {
            throw Error('Invalid path for monggose model');
        }
        var modelBinds = getModelBinds(modelOps.model);
        modelOps.parent = ops;
        utils.copyAuthDefaultsFromParent(modelOps, {
            baseUrl: ops.url,
            get: modelOps.index || [{
                fun: modelBinds.index
            }],
            post: modelOps.create || [{
                fun: modelBinds.create
            }],
            'get:id': modelOps.show || [{
                fun: modelBinds.show
            }],
            'put:id': modelOps.update || [{
                fun: modelBinds.update
            }],
            'delete:id': modelOps.destroy || [{
                fun: modelBinds.destroy
            }],
        });
        ops.routes.push(modelOps);
    });
}

function getMongooseModel(modelName) {
    var mongoose = require('mongoose');
    return mongoose.model(modelName);
}

function parseInlineMethod(ops, matches, methodOps) {
    ops.methods = ops.methods || [];
    methodOps = {
        fun: methodOps
    };
    methodOps.verb = matches[1];
    ops.methods.push(methodOps);
};

function parseInlineRoute(ops, matches, routeOps) {
    ops.routes = ops.routes || [];
    routeOps = {
        fun: routeOps
    };
    routeOps.verb = matches[1];
    routeOps.path = matches[1];
    ops.routes.push({
        path: changeCase.lowerCase(matches[2]),
        methods: [routeOps]
    });
};

function getModelBinds(model) {
    return {
        index: index,
        show: show,
        create: create,
        update: update,
        destroy: destroy
    };

    function index(req, res) {
        model.find(function(err, items) {
            if (err) {
                return handleError(res, err);
            }
            return res.status(200).json(items);
        });
    }

    function show(req, res) {
        model.findById(req.params.id, function(err, item) {
            if (err) {
                return handleError(res, err);
            }
            if (!item) {
                return res.send(404);
            }
            return res.json(item);
        });
    }

    function create(req, res) {
        model.create(req.body, function(err, item) {
            if (err) {
                return handleError(res, err);
            }
            return res.status(201).json(item);
        });
    }

    function update(req, res) {
        if (req.body._id) {
            delete req.body._id;
        }
        model.findById(req.params.id, function(err, item) {
            if (err) {
                return handleError(res, err);
            }
            if (!item) {
                return res.send(404);
            }
            var updated = _.merge(item, req.body);
            updated.save(function(err) {
                if (err) {
                    return handleError(res, err);
                }
                return res.status(200).json(item);
            });
        });
    }

    function destroy(req, res) {
        model.findById(req.params.id, function(err, item) {
            if (err) {
                return handleError(res, err);
            }
            if (!item) {
                return res.send(404);
            }
            item.remove(function(err) {
                if (err) {
                    return handleError(res, err);
                }
                return res.send(204);
            });
        });
    }

    function handleError(res, err) {
        return res.send(500, err);
    }
}

function resolveShortHandOps(type, ops) {
    if (_.isUndefined(ops)) {
        return undefined;
    }
    switch (type) {
        case 'model': 
            if (_.isString(ops)) {
                if (/\w+/.test(ops)) {
                    utils.error('invalid model name' + ops);
                } else {
                    ops = {
                        path: ops,
                        model: ops
                    };
                }
            }
            if (_.isString(ops.model)) {
                ops.model = getMongooseModel(ops.model);
            }
            break;
    }
    return ops;
}
