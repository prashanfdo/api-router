'use strict';
//node-debug C:\Users\prashanf\AppData\Roaming\npm\node_modules\grunt-cli\bin\grunt default
var inlineParser = require('../lib/ops-parser.js');
var should = require('should');


describe('Inline Parser', function() {
    describe('#methods', function(done) {
        it("should parse a simple method", function() {
            var ops = {
                get: {
                    fun: true
                }
            };
            inlineParser.parseInlines(ops);
            (ops).should.eql({
                methods: [{
                    fun: true,
                    verb: 'get'
                }]
            });
        });
    });
    describe('#routes', function(done) {
        it("should parse a simple route", function() {
            var ops = {
                getMeta: {
                    fun: true
                }
            };
            inlineParser.parseInlines(ops);
            (ops).should.eql({ 
                routes: [{
                    methods: [{
                        fun: true,
                        path: "get",
                        verb: "get"
                    }],
                    path: "meta"
                }]
            });

        });
    });
});
