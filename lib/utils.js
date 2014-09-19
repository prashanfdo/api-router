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
    getAuthResolver:getAuthResolver,
    getAuthorizationResolver:getAuthorizationResolver,
    passThrough:passThrough,
    copyAuthDefaultsFromParent:copyAuthDefaultsFromParent
};

function copyAuthDefaultsFromParent(ops,more) {
	ops = ops || {};
    defaults(ops, {
        allow: ops.parent.allow,
        anonymous: ops.parent.anonymous,
    });
    defaults(ops,more);
    ops.authResolver = ops.authenticator && getAuthResolver(ops.authenticator) || ops.parent.authResolver;
    ops.authorizationResolver = ops.authorizer && getAuthorizationResolver(ops.authorizer) || ops.parent.authorizationResolver;
    return ops;
}
function defaults(obj, defaultOps) {
	obj = obj || {};
    var defaults = _.partialRight(_.assign, function(a, b) {
        return typeof a == 'undefined' ? b : a;
    });
    defaults(obj, defaultOps);
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
    return function(req, res, next) {
        if (!authorizer || authorizer(req, res)) {
            next();
        } else {
            res.status(403).end();
        }
    };
}

function passThrough(req, res, next) {
    next();
}
