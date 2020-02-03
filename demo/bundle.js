
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
(function (RestClient) {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object.keys(descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object.defineProperty(target, property, desc);
      desc = null;
    }

    return desc;
  }

  var _dec, _dec2, _dec3, _class, _class2;
  var use = RestClient.decorators.use,
      retry = RestClient.decorators.retry,
      timeout = RestClient.decorators.timeout;
  var Test = (_dec = use('request', function (req, next) {
    console.info('This is a request Plugin!');
    next();
  }), _dec2 = retry(), _dec3 = timeout(), _dec(_class = (_class2 =
  /*#__PURE__*/
  function (_Client) {
    _inherits(Test, _Client);

    function Test() {
      _classCallCheck(this, Test);

      return _possibleConstructorReturn(this, _getPrototypeOf(Test).apply(this, arguments));
    }

    _createClass(Test, [{
      key: "getTodos",
      value: function getTodos() {
        return this.get('https://jsonplaceholder.typicode.com/todos', {
          userId: 10
        });
      }
    }]);

    return Test;
  }(RestClient.Client), (_applyDecoratedDescriptor(_class2.prototype, "getTodos", [_dec2, _dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "getTodos"), _class2.prototype)), _class2)) || _class);
  var client = new Test();
  var table = document.getElementById('table');
  client.getTodos().then(function (data) {
    var tmp = ['GET', 'https://jsonplaceholder.typicode.com/todos', JSON.stringify({
      userId: 10
    }), '-', JSON.stringify(data)];
    var newRow = table.insertRow(-1);
    newRow.innerHTML = '<td>' + tmp.join('</td><td>') + '</td>';
  });

}(RestClient));
