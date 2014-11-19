/*Features
-----------
	- builtin authenticator,authorizer
	- model binding
	- client scripts generating
	api.blogs.get();
	api.blogs.getStarred();
	api.



*/

var ops = {
    name: 'api',
    path: 'api',
    authenticator: function() {},
    authorizer: function() {},
    clientScript: {
        url: 'api.js'
    },
    anonymous: true,

    methodCollection: [{
        name: '',
        path: '',
        methods: [{
            fun: function(req, res, id, body) {},
            verb: '',
            allow: '',
            anonymous: false,
            clientScriptMethod: {
                name: ''
            }
        }],
    }],
    routeCollection: [],
    models: [{
        path: 'thing',
        model: thing,
        anonymous: true,
        allow: '',
        index: {
            anonymous: true,
            allow: '',
            fun: (void 0)
        },
        show: undefined,
        create: undefined,
        update: undefined,
        destroy: undefined,
        methods: [{
            fun: function(req, res, id, body) {},
            verb: '',
            allow: '',
            anonymous: false,
            clientScriptMethod: {
                name: ''
            }
        }],
    }]
}


var scriptOps = {
    name: 'api.js',
    methods: [{
        url: '/api/signin',
        verb: 'get',
        params: ['id'],
        name: 'signIn' //api.signin(id); 
    }, {
        url: '/api/signin',
        verb: 'get',
        params: ['id'] //api.signin(id); 
    }, {
        url: '/api/thing',
        verb: 'get',
        params: ['id'] //api.signin(id); 
    }]
};

var ops = {
	//Route
    authenticator: function(req, res) { 
    },
    authorizer: function(req, res, allowed) { 
    },
    path: 'api',
    allow: 'user',
	methods:[{
		//Method
		verb:'get',
		handlers:[{
			//Handle
			allow:'admin',fun:function() {}
		}]
    }],
    models:[{
    	model:modelObj,
    	handle:[{
    		allow:'guest',
    		fun:function  () {	
    		},
    	}]

    }],
    routes: [{
        path: 'admin',
        allow: 'admin manager',
    }]
};
