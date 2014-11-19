/*
 * api-router
 * https://github.com/Prashanfdo/api-router
 *
 * Copyright (c) 2014 Prashan Fernando
 * Licensed under the MIT license.
 */

'use strict';
var _ = require('lodash');
module.exports = {
    defaults: defaults,
    getAuthResolver: getAuthResolver,
    getAuthorizationResolver: getAuthorizationResolver,
    passThrough: passThrough,
    copyAuthDefaultsFromParent: copyAuthDefaultsFromParent,
    validateAuthorization: validateAuthorization,
    getPassThroughFun: getPassThroughFun,
    warn: warn,
    error: error,
    log: log
};

var colors = require('colors');

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

function warn(msg) {
    console.log(msg.warn);
}

function log(msg) {
    console.log(msg.prompt);
}

function error(msg) {
    console.log(msg.error);
}

function getPassThroughFun(type) {
    switch (type) {
        case 'authenticator':
        case 'authorizer':
            return function() {
                return true;
            };
    }
}

function copyAuthDefaultsFromParent(ops, more) {
    ops = ops || {};
    defaults(ops, {
        allow: ops.parent.allow,
        anonymous: ops.parent.anonymous,
        authenticator: ops.parent.authenticator,
        authorizer: ops.parent.authorizer,
    });
    defaults(ops, more);
    ops.authResolver = ops.authenticator && getAuthResolver(ops.authenticator) || ops.parent.authResolver;
    ops.authorizationResolver = ops.authorizer && getAuthorizationResolver(ops.authorizer) || ops.parent.authorizationResolver;
    return ops;
}

function defaults(obj, defaultOps) {
    defaults.innerFun = defaults.innerFun || _.partialRight(_.assign, function(a, b) {
        return typeof a == 'undefined' ? b : a;
    });
    if (_.isPlainObject(obj) || obj === undefined) {
        obj = obj || {};
        defaults.innerFun(obj, defaultOps);
    }
    return obj;
}

function getAuthResolver(authenticator) {
    return function(req, res, next) {
        if (!authenticator || authenticator(req, res)) {
            next();
        } else {
            res.status(401).end();
        }
    };
}

function getAuthorizationResolver(authorizer) {
    return function(req, res, next, allowed) {
        if (!authorizer || authorizer(req, res, allowed)) {
            next();
        } else {
            res.status(403).end();
        }
    };
}

function validateAuthorization(authorizationResolver, allowed) {
    return function(req, res, next) {
        authorizationResolver(req, res, next, allowed);
    };
}

function passThrough(req, res, next) {
    next();
}
