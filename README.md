# api-router [![Build Status](https://travis-ci.org/Prashanfdo/api-router.svg)](http://travis-ci.org/prashanfdo/api-router)

> Beefup your routes in minutes.


## Getting Started

Install the module with: `npm install api-router`

```js
var api-router = require('api-router');
```
  
## Usage

```js
var express = require('express');
var api-router = require('api-router');

app = express();

apiRouter(app,{
                url: 'api',
                authResolver: function(req, res) {
                    return true;
                },
                authorizationResolver: function(roles,req, res) {
                    return true;
                },
                // GET /api
                get: function(req,res){
                  res.send({
                      hello: 'world'
                  });
                },
                //  POST /api
                post:  function(req,res){
                  res.send({
                      hello: 'post-er'
                  });
                },
                // write your get,post methods with methods. This method will be routed to -> GET /api/meta
                getMeta: {
                    anonymous: true, //-> allow anonymous access
                    method: function(req,res){
                        res.send({hello: 'anonymous'});
                    }
                },
                //-> POST /api/meta
                postMeta: return200,
                //child routes
                routes: [{
                    url: 'user',
                    //-> GET /api/user
                    get: function(req,res){
                      res.send({
                          hello: 'world'
                      });
                    },
                    //-> POST /api/user
                    postUser: function(req,res){
                      res.send({
                          hello: 'world'
                      });
                    },
                    routes: [{
                        url: 'admin',
                        //-> POST /api/user/admin
                        postCreate: function(req,res){
                          res.send({
                              hello: 'world'
                          });
                        }
                    }]
                }]
            });
            server = app.listen(3000);
            done();
```
## Featrures

### Mongoose model bind
Bind a Mongoose model directly.
```js
var BlogPostModel = mongoose.model('BlogPost');
var ops = {
                authResolver: function(req, res, next) {
                    return true;
                },
                authorizationResolver: function(req, res, next) {
                    return true;
                },
                url: 'api',
                model:BlogPostModel, // or just pass the model name 'BlogPost'
            };
apiRouter(app, ops);
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com).


## License

Copyright (c) 2014 Prashan Fernando  
Licensed under the MIT license.


inside dev