define(function () { 'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  /**
   * Plugin Object to deal with plugins.
   *
   * @file src/plugin.js
   * @author helianthuswhite(hyz19960229@gmail.com)
   */

  var Plugin = function () {
      function Plugin() {
          classCallCheck(this, Plugin);

          this.stack = [];
          this.index = 0;
          this.options = null;
      }

      //  use a plugin


      createClass(Plugin, [{
          key: 'use',
          value: function use(fn) {
              if (typeof fn !== 'function') {
                  throw new Error('The plugin should be a function.');
              }

              this.stack.push(fn);

              return this;
          }

          //  remove a plugin by index

      }, {
          key: 'abort',
          value: function abort(index) {
              if (index) {
                  this.stack.splice(index, 1);
              } else {
                  this.stack.pop();
              }

              return this;
          }

          //  hanlde plugins in order

      }, {
          key: 'handle',
          value: function handle(options) {
              var _this = this;

              this.index = 0;
              this.options = options;

              var next = function next(err) {
                  var fn = _this.stack[_this.index++];

                  if (!fn) {
                      return;
                  }

                  _this.__call(fn, err, next);
              };

              next();
          }
      }, {
          key: '__call',
          value: function __call(fn, err, next) {
              //  catch error to next
              try {
                  if (err && fn.length === 3) {
                      fn(err, this.options, next);
                      return;
                  }
                  if (!err && fn.length < 3) {
                      fn(this.options, next);
                      return;
                  }
              } catch (e) {
                  /*  eslint-disable */
                  err = e;
                  /*  eslint-enable */
              }

              next(err);
          }
      }]);
      return Plugin;
  }();

  /**
   * Utils
   *
   * @file src/utils.js
   * @author helianthuswhite(hyz19960229@gmail.com)
   */

  // parseHeaders https://github.com/axios/helper/parseHeaders.js
  var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var ignoreDuplicateOf = ['age', 'authorization', 'content-length', 'content-type', 'etag', 'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since', 'last-modified', 'location', 'max-forwards', 'proxy-authorization', 'referer', 'retry-after', 'user-agent'];

      if (headers) {
          headers.split('\n').forEach(function (line) {
              var i = line.indexOf(':');
              var key = line.substr(0, i).trim().toLowerCase();
              var val = line.substr(i + 1);

              if (key) {
                  if (parsed[key] && ignoreDuplicateOf.indexOf(key)) {
                      return;
                  }
                  if (key === 'set-cookie') {
                      parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
                  } else {
                      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
                  }
              }
          });
      }

      return parsed;
  };

  var extend = function extend() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
      }

      var obj = {};
      for (var i = 0; i < args.length; i++) {
          var source = args[i];
          for (var prop in source) {
              if ({}.hasOwnProperty.call(source, prop)) {
                  obj[prop] = source[prop];
              }
          }
      }
      return obj;
  };

  var isObject = function isObject(obj) {
      return obj === Object(obj);
  };

  var getQuery = function getQuery(obj) {
      var query = '';

      if (!isObject(obj) || !Object.keys(obj).length) {
          return query;
      }

      Object.keys(obj).forEach(function (key) {
          var str = '&' + key + '=' + obj[key];
          query += str;
      });

      return query.replace('&', '?');
  };

  /**
   * Ajax core object.
   *
   * @file src/ajax.js
   * @author helianthuswhite(hyz19960229@gmail.com)
   */

  var Ajax = function () {
      function Ajax(config) {
          classCallCheck(this, Ajax);

          this.config = config || {};

          //  prepare tow plugin queues
          this.req = new Plugin();
          this.res = new Plugin();
      }

      /**
       * Request in XMLHttprequest
       *
       * @param {meta.AjaxOption} options configs
       * @param {meta.AjaxOption.String} options.method request method
       * @param {meta.AjaxOption.String} options.url request url
       * @param {meta.AjaxOption.Number} options.timeout request timeout
       * @param {meta.AjaxOption.Func} options.validateStatus response validateStatus
       * @param {meta.AjaxOption.String} options.responseType response responseType
       * @param {meta.AjaxOption.Bool} options.withCredentials request cors
       * @param {meta.AjaxOption.Func} options.onDownloadProgress download progress
       * @param {meta.AjaxOption.Func} options.onUploadProgress upload progress
       *
       * @return {meta.requseter}
       */


      createClass(Ajax, [{
          key: 'request',
          value: function request() {
              var _this = this;

              var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

              return new Promise(function (resolve, reject) {
                  var options = extend(_this.config, config);

                  //  to handle request plugins
                  _this.req.handle(options);

                  options.method = options.method ? options.method.toLowerCase() : 'get';

                  //  set validateStatus function
                  options.validateStatus = options.validateStatus || function (status) {
                      return status >= 200 && status < 300;
                  };

                  var xhr = new XMLHttpRequest();

                  xhr.open(options.method.toUpperCase(), options.url, true);

                  // set timeout handler
                  xhr.timeout = options.timeout;

                  xhr.onreadystatechange = function () {
                      if (xhr.readyState === 4) {
                          // prepare the response
                          var responseHeaders = parseHeaders(xhr.getAllResponseHeaders());

                          var response = {
                              data: xhr.responseText,
                              status: xhr.status === 1223 ? 204 : xhr.status,
                              statusText: xhr.status === 1223 ? 'No Content' : xhr.statusText,
                              headers: responseHeaders,
                              config: options,
                              request: xhr
                          };

                          //  use plugin to handle response
                          _this.res.use(function (res) {
                              //  abort this handler when exec
                              _this.res.abort();

                              if (options.validateStatus(res.status)) {
                                  resolve(res.data);
                              } else {
                                  reject(res.data);
                              }
                          });

                          //  to handle response plugins
                          _this.res.handle(response);
                      }
                  };

                  // Handle abort
                  xhr.onabort = function () {
                      // Fix some brower change readyState to 4
                      xhr.onreadystatechange = null;

                      reject(new Error('Request aborted.'));
                  };

                  // Handle low level network errors
                  xhr.onerror = function () {
                      reject(new Error('Network Error.'));
                  };

                  // Handle timeout
                  xhr.ontimeout = function () {
                      reject(new Error('timeout of ' + options.timeout + 'ms exceeded'));
                  };

                  // Handle progress if needed
                  if (typeof options.onDownloadProgress === 'function') {
                      xhr.addEventListener('progress', options.onDownloadProgress);
                  }

                  // Not all browsers support upload events
                  if (typeof options.onUploadProgress === 'function' && xhr.upload) {
                      xhr.upload.addEventListener('progress', options.onUploadProgress);
                  }

                  // Add withCredentials to request if needed
                  if (options.withCredentials) {
                      xhr.withCredentials = true;
                  }

                  // Add headers to the request
                  Object.keys(options.headers).forEach(function (key) {
                      if (typeof options.data === 'undefined' && key.toLowerCase() === 'content-type') {
                          // Remove Content-Type if data is undefined
                          delete options.headers[key];
                      } else {
                          // Otherwise add header to the request
                          xhr.setRequestHeader(key, options.headers[key]);
                      }
                  });

                  // Add responseType to request if needed
                  if (options.responseType) {
                      try {
                          xhr.responseType = options.responseType;
                      } catch (e) {
                          if (options.responseType !== 'json') {
                              throw e;
                          }
                      }
                  }

                  // Send the request
                  xhr.send(options.data);
              });
          }
      }]);
      return Ajax;
  }();

  /**
   * a request plugin
   *
   * @file src/plugins/request.js
   * @author helianthuswhite(hyz19960229@gmail.com)
   */

  var requestPlugin = (function () {
      return function (req, next) {
          //  set default request headers
          req.headers = req.headers || {};
          req.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

          if (isObject(req.data)) {
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
  });

  /**
   * a response plugin
   *
   * @file src/plugins/response.js
   * @author helianthuswhite(hyz19960229@gmail.com)
   */

  var responsePlugin = (function () {
      return function (res, next) {
          if (typeof res.data === 'string') {
              try {
                  res.data = JSON.parse(res.data);
              } catch (e) {/* Ignore */}
          }

          next();
      };
  });

  /**
   * Abstract class
   *
   * @file src/client.js
   * @author helianthuswhite(hyz19960229@gmail.com)
   */

  var Client = function (_Ajax) {
      inherits(Client, _Ajax);

      function Client(config) {
          classCallCheck(this, Client);

          var _this = possibleConstructorReturn(this, (Client.__proto__ || Object.getPrototypeOf(Client)).call(this, config));

          _this.initMethods();

          _this.req.use(requestPlugin());
          _this.res.use(responsePlugin());
          return _this;
      }

      createClass(Client, [{
          key: 'initMethods',
          value: function initMethods() {
              var _this2 = this;

              ['post', 'put'].forEach(function (item) {
                  _this2[item] = function (url, data) {
                      var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                      var options = extend({
                          url: url,
                          data: data,
                          method: item
                      }, config);

                      return _this2.request(options);
                  };
              });

              ['get', 'delete'].forEach(function (item) {
                  _this2[item] = function (url, data) {
                      var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

                      var options = extend({
                          url: url + getQuery(data),
                          method: item
                      }, config);

                      return _this2.request(options);
                  };
              });
          }
      }]);
      return Client;
  }(Ajax);

  return Client;

});
