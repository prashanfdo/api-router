;
(function() {
    'use strict';
    window.@model.name = {};
    createNamespaces(window.@model.name);
    @model.methods.forEach(function(method) {
    <text>
    @{method.fullName = method.namespace + '.' + method.name}@method.fullName = function(@method.params){return call('@method.url', '@method.verb', arguments)};</text>
    });

    function call(url, verb, arguments) {
        url = parseParameterizedUrl(url,arguments);
        var xhr = $.ajax({
            type: verb,
            url: url,
            data: verb !== 'get' && arguments[arguments.length - 1] || {},
            success: function() {},
            dataType: 'json'
        });
        return xhr;
    }
    function createNamespaces(api) {
        var names = [@model.namespaces.forEach(function (namespace) {
            <text>'@namespace',</text>
        })];
        for (var i = 0; i < names.length; i++) {
            var splits = names[i].split('.');
            var lastObj = api;
            for(var j = 1; j < splits.length; j++){
                lastObj = lastObj[splits[j]] = lastObj[splits[j]] || {};
            }
        };
    }
    function parseParameterizedUrl(url,params){
        for (var i = 0; i < params.length; i++) {
             url = url.replace(/:[a-z]+/i,params[i]);
        }
        return url;
    }
})();
