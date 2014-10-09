'use strict';
//node-debug C:\Users\prashanf\AppData\Roaming\npm\node_modules\grunt-cli\bin\grunt default
var clientScriptGenerator = require('../lib/client-script-generator.js');
var should = require('should');


describe('api-router', function() {
    describe('Client Scripts', function() {
        describe('initial', function() {
            it('Sould pass basics', function() {
                var generator = new clientScriptGenerator({
                	name:'api',
                    methods: [{
                        namespace: 'api',
                        url: '/api/signin',
                        name:'signin',
                        verb:'post',
                        params: ['data']
                    },{
                        namespace: 'api',
                        url: '/api/touch',
                        name:'touch',
                        verb:'get',
                        params: ['data']
                    },{
                        namespace: 'api.user',
                        url: '/api/user/admin',
                        name:'getAdmin',
                        verb:'get',
                        params: ['data']
                    },{
                        namespace: 'api.thing',
                        url: '/api/thing',
                        name:'find',
                        verb:'get',
                        params: []
                    },{
                        namespace: 'api.thing',
                        url: '/api/thing/:id',
                        name:'findById',
                        verb:'get',
                        params: ['id']
                    },{
                        namespace: 'api.thing',
                        url: '/api/thing',
                        name:'add',
                        verb:'post',
                        params: ['data']
                    },{
                        namespace: 'api.thing',
                        url: '/api/thing/:id',
                        name:'update',
                        verb:'put',
                        params: ['id','data']
                    },{
                        namespace: 'api.thing',
                        url: '/api/thing/:id',
                        name:'remove',
                        verb:'delete',
                        params: ['id']
                    }]
                });
                var script = generator.getScript(); 
            });
        });
    });
}); 
// POST     ano:true       allow:          /api/signin
// GET      ano:false      allow:          /api/touch  
// GET      ano:false      allow:          /api/user/admin
// GET      ano:false      allow:          /api/thing 
// GET      ano:false      allow:          /api/thing/:id
// PUT      ano:false      allow:          /api/thing/:id
// DELETE   ano:false      allow:          /api/thing/:id
