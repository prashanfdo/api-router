/*
 * api-router
 * https://github.com/Prashanfdo/api-router
 *
 * Copyright (c) 2014 Prashan Fernando
 * Licensed under the MIT license.
 */

'use strict';
var _ = require('underscore');
var deepExtend = require('deep-extend');
var changeCase = require('change-case');
var passport = require('passport');
var mongoose = require('mongoose');

module.exports = function(app, ops) {
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
        deepExtend(routeOps, ops);




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
            deepExtend(routeOps, ops);
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
        route[verb](getAuthenticater(authResolver), getAuthorizer(authorizationResolver), routeFun);
    }

    function getAuthenticater(authResolver) {
        return function(req, res, next) {
            if (!authResolver || authResolver(req, res)) {
                next();
            } else {
                res.status(401).end();
            }
        }
    }

    function getAuthorizer(authorizationResolver) {
        return function(req, res, next) {
            if (!authorizationResolver || authorizationResolver(req, res)) {
                next();
            } else {
                res.status(403).end();
            }
        }
    }
 
    function getModelBind(type, model) {
        switch (type) {
            case 'index': return index; 
            case 'show': return show; 
            case 'create': return create; 
            case 'update': return update; 
            case 'destroy': return destroy; 
        }

        // Get list of things
        function index(req, res) {
          model.find(function (err, things) {
            if(err) { return handleError(res, err); }
            return res.status(200).json(things);
          });
        };

        // Get a single thing
        function show(req, res) { 
          model.findById(req.params.id, function (err, thing) {
            if(err) { return handleError(res, err); }
            if(!thing) { return res.send(404); }
            return res.status(200).json(thing);
          });
        };

        // Creates a new thing in the DB.
        function create(req, res) {
          model.create(req.body, function(err, thing) {
            if(err) { return handleError(res, err); }
            return res.status(201).json(thing);
          });
        };

        // Updates an existing thing in the DB.
        function update(req, res) {
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
        function destroy(req, res) {
          model.findById(req.params.id, function (err, thing) {
            if(err) { return handleError(res, err); }
            if(!thing) { return res.send(404); }
            thing.remove(function(err) {
              if(err) { return handleError(res, err); }
              return res.status(204).json(thing);
            });
          });
        };

        function handleError(res, err) {
          return res.status(500).json(err);
        }
    }
};
module.exports.prototype.passportAuth = function() {
    //console.log('pass auth');
}
