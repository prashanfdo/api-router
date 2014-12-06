'use strict';
//node-debug C:\Users\prashanf\AppData\Roaming\npm\node_modules\grunt-cli\bin\grunt default
var utils = require('../lib/utils.js');
var should = require('should');

describe('Utils', function() { 
    it('utils.defaults() should work', function() {
        var ops = {
            handlerCollection:undefined
        };
        utils.defaults(ops,{
            handlerCollection:[]
        });
        ops.should.containDeep({handlerCollection:[]});
    });
});