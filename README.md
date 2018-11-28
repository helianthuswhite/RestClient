# RestClient
Restful HTTP Client for broswer.

## Installation
Using npm:

    $ npm install @baiducloud/restclient

## Example
Basic use as a post method.

```js

import Client from '@baiducloud/restclient';

const client = new Client();
const params = {
    name: 1
};
const options = {
    headers: {
        'X-request-By': 'RestClient'
    }
};
client.post('/api/test', params, options).then(data => {
    ...
});

```

Use as a base Class to extended in ES6.

```js
import Client from '@baiducloud/restclient';

export default new class extends Client {
    constructor() {
        const options = {
            headers: {
                'X-request-By': 'RestClient'
            }
        };
        super(options);
    }

    getList(params) {
        this.get('/api/getList', params);
    }
}
```

Build your own plugins to handle request and response.

```js
import Client from '@baiducloud/restclient';

const requestPlugin = region => (req, next) => {
    req.region = region || {};
    req.headers = Object.assign({}, req.headers, {'x-region': region});

    next();
};

const responsePlugin = () => (res, next) => {
    if (!res.data.success || res.data.success === 'false') {
        res.status = 500;
        res.data.error = 'Internal Server Error.';
    }

    next();
};

export default new class extends Client {
    constructor() {
        super();

        this.req.use(requestPlugin());
        this.res.use(responsePlugin());
    }

    getList(params) {
        this.get('/api/getList', params);
    }
}
```

## Options
There are some options offer to config. You can init them in constructor or as an option when exec a restful method.

```js
{
    //  the request headers
    headers: {}

    //  if the request time out, it will be aborted
    timeout: 0

    //  a function to validate response status
    validateStatus: function(status) {
        return status >= 200 && status < 300;
    }

    // specifies what type of data the response contains
    responseType: null

    //  the config is a Boolean that indicates whether or not cross-site Access-Control requests
    //  should be made using credentials such as cookies, authorization headers or TLS client certificates
    withCredentials: false,

    //  a function to handle the download progress event
    onDownloadProgress: null

    //  a function to handle the upload progress event
    onUploadProgress: null

    /**  
        next three options can alse be set in options, 
        but it's not a good practice to do this instead of using restful methods.
    **/

    //  the request url
    url: *

    //  the request method
    method: *

    //  the request data
    data: *
}
```

## Plugins

**Plugins execute in order.**

The plugin is the most important part of restclient. It makes it easy to extends our api requester, particularly in complicated WebApps. And it’s coupling with business is very low, therefore easy to be changed and replaced.

Example we have used several customized plugins in BaiduCloud.

- headers plugin to handle different headers.
- crsf plugin to handle crsftoken.
- sdk plugin to handle sdk requests.
- mfa plugin to handle Multi-factor authentication.
- response plugin to handle common response.
- notification plugin to handle common error windows.
- monitor plugin to collect requests infos.


RestClient has two plugin queues, respectively are the request queue as `req` property and  the response queue as `res` property. 

The default request plugin:
```js
export default () => (req, next) => {
    //  set default request headers
    req.headers = req.headers || {};
    req.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    if (utils.isObject(req.data)) {
        req.headers['Content-Type'] = 'application/json;charset=utf-8';
        req.data = JSON.stringify(req.data);
    }

    //  set requester info
    req.headers['X-Request-By'] = 'RestClient';

    //  set csrftoken
    req.headers.csrftoken = new Date().getTime();

    //  to handle next plugin
    next();
};
```

The default response plugin:
```js
export default () => (res, next) => {
    if (typeof res.data === 'string') {
        try {
            res.data = JSON.parse(res.data);
        } catch (e) { /* Ignore */ }
    }

    next();
};
```

### How to build a plugin?
A plugin is just like a nodejs middleware, it receive two params (the first is `req/res` and the second is `next`).

You can handle the request or the response in your plugin, but remember to exec `next` function or the next plugin will not be executed.

In the end, you need to use your plugin by `client.req|res.use()` method.

```js
import Client from '@baiducloud/restclient';

const client = new Client();

client.req.use((req, next) => {
    //  handle request

    //  remember next()
    next();
});

client.res.use((res, next) => {
    //  handle response

    //  remember next()
    next();
});
```

### Plugin apis
Plugin offers some apis for handle plugins more convenient.

- plugin.use(fn)    //  to push a plugin in queue
- plugin.handle(options)    //  start handle options in plugins one by one
- plugin.abort(index)   //  abort a plugin in queue by index

## Methods
RestClient offers four Restful methods as `get`、`put`、`post`、`delete`. And the api returns a Promise.

```js
client.get|post|put|delete(url, data, options);
```

It also supports to add method by using `request` method in prototype.

```js
import Client from '@baiducloud/restclient';

class extends Client {
    patch(url, data, options) {
        const config = {
            url,
            data
        };

        return this.request(Object.assign({}, config, options));
    }
}
```

## License
MIT