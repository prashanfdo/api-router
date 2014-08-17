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

        var route = app.route(parentPath + '/' + routeOps.url);
        for (var prop in routeOps) {
            var methodOps = routeOps[prop];
            var matches = prop.match(/^(get|post|delete|put)([^\/]*)?$/i);
            if (matches === null) {
                continue;
            }
            var verb = matches[1];
            var method = matches[2];
            var authResolver = routeOps.anonymous && passWithNoOp || routeOps.authResolver;
            var authorizationResolver = routeOps.authorizationResolver;
            var methodRoute = !method && route || app.route(parentPath + '/' + routeOps.url + '/' + changeCase.camelCase(method));
            registerMethod(routeOps, methodRoute, verb, authResolver, authorizationResolver, methodOps);
        }
        parentPath = parentPath + '/' + routeOps.url;
        if (routeOps.routes !== undefined && routeOps.routes.length) {
            _.each(routeOps.routes, function(route) {
                registerRoute(parentPath, route);
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
};
