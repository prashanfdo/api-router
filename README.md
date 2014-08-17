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
                authResolver: function(req, res, next) {
                    return true;
                },
                authorizationResolver: function(req, res, next) {
                    return true;
                },
                url: 'api',
                get: return200,
                post: return200,
                getMeta: {
                    anonymous: true,
                    method: return200
                },
                postMeta: return200,
                routes: [{
                    url: 'user',
                    get: return200,
                    postUser: return200,
                    routes: [{
                        url: 'admin',
                        postCreate: return200
                    }]
                }]
            });
            server = app.listen(3000);
            done();
```


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com).


## License

Copyright (c) 2014 Prashan Fernando  
Licensed under the MIT license.
