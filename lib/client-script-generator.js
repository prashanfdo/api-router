/*
 * api-router
 * https://github.com/Prashanfdo/api-router
 *
 * Copyright (c) 2014 Prashan Fernando
 * Licensed under the MIT license.
 */

'use strict';
var vash = require('vash');
var _ = require('lodash');
var fs = require('fs');
var UglifyJS = require("uglify-js");

module.exports = ClientScriptGenerator;



function ClientScriptGenerator(clientScriptOps) {
    var script,minScript;

    this.getScript = function() {
        if(!script){
            script = createScript();
        }
        return script;        
    };
    this.getMinScript = function() {
        if(!minScript){
            minScript = UglifyJS.minify(script, {fromString: true}).code;
        }
        return minScript;
    };


    function createScript() { 
        var scriptTemplate = fs.readFileSync('lib/client-script-template.js','utf8');
        var tpl = vash.compile(scriptTemplate); 
        var model = getModel();
        return tpl(model);
    }

    function getModel() { 
        var model = clientScriptOps;
        model.namespaces = []; 
        model.methods.forEach(function  (method) {
            model.namespaces.push(method.namespace);
        });
        model.namespaces = _.uniq(model.namespaces);
        return model; 
    }
}
