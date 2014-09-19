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
    parseModels: parseModels
};


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
        if (!modelOps.model) {
            throw Error('Invalid args:model property undefined');
        }
        if (modelOps.model.prototype.constructor.name !== 'model') {
            throw Error('Invalid args:model is not a mongoose model instance');
        }
        var modelBinds = getModelBinds(modelOps.model);
        modelOps.parent = ops;
        utils.copyAuthDefaultsFromParent(modelOps, {
            baseUrl: ops.url,
            get: utils.defaults(modelOps.index, {
                fun: modelBinds.index
            }),
            post: utils.defaults(modelOps.create, {
                fun: modelBinds.create
            }),
            'get:id': utils.defaults(modelOps.show, {
                fun: modelBinds.show
            }),
            'put:id': utils.defaults(modelOps.update, {
                fun: modelBinds.update
            }),
            'delete:id': utils.defaults(modelOps.destroy, {
                fun: modelBinds.destroy
            }),
        });
        ops.routes.push(modelOps);
    });
}

function parseInlineMethod(ops, matches, methodOps) {
    ops.methods = ops.methods || [];
    if (_.isFunction(methodOps)) {
        methodOps = {
            fun: methodOps
        };
    }
    methodOps.verb = matches[1];
    ops.methods.push(methodOps);
};

function parseInlineRoute(ops, matches, routeOps) {
    ops.routes = ops.routes || [];
    if (_.isFunction(routeOps)) {
        routeOps = {
            fun: routeOps
        };
    }
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
