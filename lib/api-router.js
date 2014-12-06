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
var parser = require('./ops-parser.js');

module.exports = function(app, ops) {
    parser.parse(ops);
    processRoute(app, ops);

    // var clientScriptMethods = [];
    // deepExtend(ops.clientScript, {
    //     name: 'api.js'
    // });
};


function processRoute(app, ops) {
    ops.expressRoute = app.route(ops.url);
    _.forEach(ops.methodCollection, function(methodOps) {
        methodOps.parent = ops;
        processMethod(app, methodOps);
    });
    _.forEach(ops.routeCollection, function(childRouteOps) {
        childRouteOps.parent = ops;
        processRoute(app, childRouteOps);
    });
}

function processMethod(app, ops) {
    registerRouteMethod(app, ops);
}

function registerRouteMethod(app, ops) {
    ops.parent.expressRoute[ops.verb](getProcessHandler(app, ops));
}

function getAuthenticationResolver(ops) {
    return function(req, res, next) {
        if (ops.anonymous || ops.authenticator(req, res)) {
            next();
        } else {
            res.status(401).end();
        }
    };
}

function getAuthorizationResolver(ops) {
    return function(req, res, next) {
        if (ops.anonymous || ops.allow === '*' || ops.authorizer(req, res, ops.allow)) {
            next();
        } else {
            res.status(403).end();
        }
    };
}

function getProcessHandler(app, ops) {
    //handle forgetting to call next
    function nextWrapper(func) {
        return function(req, res, next) {
            var nextCalled = false;
            var nextFun = function() {
                nextCalled = true;
                next();
            };
            var result = func(req, res, nextFun);
            if (result === true || !nextCalled) {
                next();
            }
        };
    }

    return function(req, res, next) {
        var allowedHandler = _.first(_.filter(ops.handlers, function(handlerOps) {
            return ops.authorizer(req, res, handlerOps.allow);
        }));
        if (allowedHandler) {
            allowedHandler.handler(req, res, next);
        } else {
            allowedHandler = _.first(_.filter(ops.fun, function(handlerOps) {
                return handlerOps.allow === '*';
            }));
            if (allowedHandler) {
                allowedHandler.handler(req, res, next);
            } else {
                utils.warn('Handler function not avaibale\r\n');
                res.status(404).send();
                next();
            }
        }
    };
}
module.exports.prototype.passportAuth = function() {
    //console.log('pass auth');
}
