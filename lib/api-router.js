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
                    get:ops.get || getModelBind('get',model),
                    post:ops.post || getModelBind('post',model),
                }
            });
            console.log(ops.model.modelName);
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

    function handleError(res, err) {
        return res.send(500, err);
    }

    function getModelBind(type, model) {
        switch (type) {
            case 'index':
                return function(req, res) {
                    model.find(function(err, things) {
                        if (err) {
                            return handleError(res, err);
                        }
                        return res.json(200, things);
                    });
                };
        }
    }
};
module.exports.prototype.passportAuth = function() {
    console.log('pass auth');
}
