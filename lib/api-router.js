/*
 * api-router
 * https://github.com/Prashanfdo/api-router
 *
 * Copyright (c) 2014 Prashan Fernando
 * Licensed under the MIT license.
 */

'use strict';
var _ = require('lodash');
var deepExtend = require('deep-extend');
var changeCase = require('change-case');
var passport = require('passport');
var mongoose = require('mongoose');
var utils = require('./utils.js');
var inlineParser = require('./ops-parser.js');

module.exports = function(app, ops) {  
    var modelBindMethods = getModelBindMethods();
    ops.parent = {
        baseUrl:'',
        url:'',
        allow:'',
        anonymous:false,
        authResolver:utils.getAuthResolver(ops.authenticator),
        authorizationResolver:utils.getAuthorizationResolver(ops.authorizer)
    };
    ops.authenticator = undefined;
    ops.authorizer = undefined;

    processRoute(ops);

    function processRoute(ops){
        utils.defaults(ops,{
            authResolver:ops.authenticator && utils.getAuthResolver(ops.authenticator) || ops.parent.authResolver,
            authorizationResolver:ops.authorizer && utils.getAuthorizationResolver(ops.authorizer) || ops.parent.authorizationResolver,
            baseUrl:ops.parent.url,
            allow:ops.parent.allow,
            anonymous:ops.parent.anonymous,
            methodCollection:[],
            routeCollection:[]
        });
        ops.url = ops.baseUrl + '/' + ops.path; 
        ops.expressRoute = app.route(ops.url); 
        inlineParser.parseModels(ops);
        inlineParser.parseInlines(ops); 
        _.forEach(ops.methods,function (methodOps) {
            methodOps.parent = ops;
            processMethod(methodOps);
        }); 
        _.forEach(ops.routes,function (childRouteOps) {
            childRouteOps.parent = ops;
            processRoute(childRouteOps);
        });
    }
    function processMethod(ops){ 
        utils.copyAuthDefaultsFromParent(ops,{ 
            verb:'get'
        });
        ops.parent.expressRoute[ops.verb](ops.anonymous === true && utils.passThrough || ops.authResolver, ops.anonymous === true && utils.passThrough || utils.validateAuthorization(ops.authorizationResolver,ops.allow), ops.fun);
        console.log(ops.verb.toString().toUpperCase() +'\t ano:'+ (ops.anonymous === true).toString() +'\tallow:'+ops.allow+'\t\t'+ops.parent.url);
    }
    function processModel(ops){ 
        if(ops.authResolver || ops.authorizationResolver)
            throw new Error('Options passed with authResolver or authorizationResolver properties');
        utils.defaults(ops,{ 
            verb:'get',
            authResolver:ops.authenticator && utils.getAuthResolver(ops.authenticator) || ops.routeOps.authResolver,
            authorizationResolver:ops.authorizer && utils.getAuthorizationResolver(ops.authorizer) || ops.routeOps.authorizationResolver,
            allow:ops.routeOps.allow,
            anonymous:ops.routeOps.anonymous,
        });

        ops.routeOps.expressRoute[ops.verb](ops.anonymous === true && utils.passThrough || ops.authResolver, ops.anonymous === true && utils.passThrough || ops.authorizationResolver, ops.fun); 
    }




    var clientScriptMethods = [];
    deepExtend(ops.clientScript,{
        name:'api.js'
    }); 

    registerRoute('', ops); 

    function passWithNoOp(req, res, next) {
        return true;
    } 
    function registerRoute(parentPath, ops) {
        var routeOps = {
            authResolver: passWithNoOp,
            authorizationResolver: passWithNoOp,
            anonymous: false,
            routes: []
        };
        deepExtend(ops,routeOps);
        if (ops.url === undefined) {
            throw new Error('url is not specified for the route');
        }

        var routePath = parentPath + '/' + routeOps.url,
            route = app.route(routePath);
        for (var prop in routeOps) {
            var methodOps = routeOps[prop];
            var matches = prop.match(/^(get|post|delete|put)([^\/]*)?$/i);
            if (matches !== null) {
                var verb = matches[1];
                var method = matches[2]; 
                var authResolver = routeOps.anonymous && passWithNoOp || routeOps.authResolver;
                var authorizationResolver = routeOps.authorizationResolver;
                var methodRoute = !method && route || app.route(parentPath + '/' + routeOps.url + '/' + changeCase.camelCase(method));
                registerMethod(routeOps, methodRoute, verb, authResolver, authorizationResolver, methodOps);
                clientScriptMethods.push({name:changeCase.camelCase(method || verb),verb:verb});
            } else if (prop == 'model') {
                registerModel(routePath, route, routeOps[prop]);
            }
        }
        parentPath = parentPath + '/' + routeOps.url;
        if (routeOps.routes !== undefined && routeOps.routes.length) {
            _.each(routeOps.routes, function(route) {
                registerRoute(parentPath, route);
            });
        }

        function registerModel(parentPath, route, ops) {
            var defaultOps = {
                model: undefined
            };
            var model;
            if (ops === undefined) {
                return console.error('model is undefined');
            }
            if (typeof(ops) === 'string') {
                ops = mongoose.model(ops);
            }
            if (ops === undefined) return console.error('model is not found in DB');
            if (ops.prototype.constructor.name === 'model') {
                ops = {
                    model: ops
                };
            }
            deepExtend(ops,routeOps);
            model = ops.model;
            registerRoute(parentPath, {
                url: ops.model.modelName,
                get:ops.get || getModelBind('index',model),
                post:ops.post || getModelBind('create',model),
                routes: [{
                    url: ':id', 
                    get: ops.getItem || getModelBind('show',model),
                    put: ops.getItem || getModelBind('update',model),
                    delete: ops.getItem || getModelBind('destroy',model)
                }]
            });
        }
    }

    function registerMethod(routeOps, route, verb, authResolver, authorizationResolver, methodOps) {
        var routeFun = methodOps;
        if (!_.isFunction(methodOps)) {
            authResolver = methodOps.authResolver || authResolver;
            authorizationResolver = methodOps.authorizationResolver || authorizationResolver;
            routeFun = methodOps.method;
        }
        route[verb](utils.getAuthenticater(authResolver), utils.getAuthorizer(authorizationResolver), routeFun); 
    }

    
 
    function getModelBindMethods() {
        return {
            index:index,
            show:show,
            create:create,
            update:update,
            destroy:destroy
        };  
        // Get list of things
        function index(req, res,model) {
          model.find(function (err, things) {
            if(err) { return handleError(res, err); }
            return res.status(200).json(things);
          });
        }

        // Get a single thing
        function show(req, res,model) { 
          model.findById(req.params.id, function (err, thing) {
            if(err) { return handleError(res, err); }
            if(!thing) { return res.send(404); }
            return res.status(200).json(thing);
          });
        }

        // Creates a new thing in the DB.
        function create(req, res,model) {
          model.create(req.body, function(err, thing) {
            if(err) { return handleError(res, err); }
            return res.status(201).json(thing);
          });
        }

        // Updates an existing thing in the DB.
        function update(req, res,model) {
          if(req.body._id) { delete req.body._id; }
          model.findById(req.params.id, function (err, thing) {
            if (err) { return handleError(res, err); }
            if(!thing) { return res.send(404); }
            var updated = _.merge(thing, req.body);
            updated.save(function (err) {
              if (err) { return handleError(res, err); }
              return res.status(200).json(thing);
            });
          });
        };

        // Deletes a thing from the DB.
        function destroy(req, res, model) {
          model.findById(req.params.id, function (err, thing) {
            if(err) { return handleError(res, err); }
            if(!thing) { return res.send(404); }
            thing.remove(function(err) {
              if(err) { return handleError(res, err); }
              return res.status(204).json(thing);
            });
          });
        }

        function handleError(res, err) {
          return res.status(500).json(err);
        }
    }
};
module.exports.prototype.passportAuth = function() {
    //console.log('pass auth');
}
