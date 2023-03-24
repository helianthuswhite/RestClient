(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.RestClient = {}));
}(this, (function (exports) { 'use strict';

  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var runtime = (function (exports) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function define(obj, key, value) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
      return obj[key];
    }
    try {
      // IE 8 has a broken Object.defineProperty that only works on DOM objects.
      define({}, "");
    } catch (err) {
      define = function(obj, key, value) {
        return obj[key] = value;
      };
    }

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    exports.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    define(IteratorPrototype, iteratorSymbol, function () {
      return this;
    });

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype =
      Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = GeneratorFunctionPrototype;
    define(Gp, "constructor", GeneratorFunctionPrototype);
    define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
    GeneratorFunction.displayName = define(
      GeneratorFunctionPrototype,
      toStringTagSymbol,
      "GeneratorFunction"
    );

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        define(prototype, method, function(arg) {
          return this._invoke(method, arg);
        });
      });
    }

    exports.isGeneratorFunction = function(genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor
        ? ctor === GeneratorFunction ||
          // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
    };

    exports.mark = function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        define(genFun, toStringTagSymbol, "GeneratorFunction");
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    exports.awrap = function(arg) {
      return { __await: arg };
    };

    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value &&
              typeof value === "object" &&
              hasOwn.call(value, "__await")) {
            return PromiseImpl.resolve(value.__await).then(function(value) {
              invoke("next", value, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return PromiseImpl.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function(error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(
            callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg
          ) : callInvokeWithMethodAndArg();
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
      return this;
    });
    exports.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      if (PromiseImpl === void 0) PromiseImpl = Promise;

      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList),
        PromiseImpl
      );

      return exports.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;

          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);

          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done
              ? GenStateCompleted
              : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };

          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator["return"]) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError(
            "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (! info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }

      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    define(Gp, toStringTagSymbol, "Generator");

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    define(Gp, iteratorSymbol, function() {
      return this;
    });

    define(Gp, "toString", function() {
      return "[object Generator]";
    });

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1, next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    exports.values = values;

    function doneResult() {
      return { value: undefined$1, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined$1;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" &&
                hasOwn.call(this, name) &&
                !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },

      stop: function() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !! caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }

            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev &&
              hasOwn.call(entry, "finallyLoc") &&
              this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry &&
            (type === "break" ||
             type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      }
    };

    // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.
    return exports;

  }(
    // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
    typeof module === "object" ? module.exports : {}
  ));

  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    // This module should not be running in strict mode, so the above
    // assignment should always work unless something is misconfigured. Just
    // in case runtime.js accidentally runs in strict mode, in modern engines
    // we can explicitly access globalThis. In older engines we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    if (typeof globalThis === "object") {
      globalThis.regeneratorRuntime = runtime;
    } else {
      Function("r", "regeneratorRuntime = r")(runtime);
    }
  }

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

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
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
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  function __decorate(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
  }

  function __awaiter(thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  }

  /**
   * Plugin Object to deal with plugins.
   *
   * @file src/plugin.js
   * @author helianthuswhite(hyz19960229@gmail.com)
   */
  var _default = /*#__PURE__*/function () {
    function _default() {
      var plugins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      _classCallCheck(this, _default);

      this.index = 0;
      this.source = null;
      this.stack = [];
      this.stack = plugins;
    }
    /**
     * push handler to stack
     * @param fn function to handle source
     */


    _createClass(_default, [{
      key: "use",
      value: function use(fn) {
        if (typeof fn !== 'function') {
          throw new Error('The plugin should be a function.');
        }

        this.stack.push(fn);
        return this;
      }
      /**
       * remove the index plugin
       * @param index the sequense of a plugin
       */

    }, {
      key: "abort",
      value: function abort(index) {
        if (index) {
          this.stack.splice(index, 1);
        } else {
          this.stack.pop();
        }

        return this;
      }
      /**
       * start execute plugins
       * @param source resource to be handled
       */

    }, {
      key: "handle",
      value: function handle(source) {
        var _this = this;

        this.index = 0;
        this.source = source;

        var next = function next(err) {
          var fn = _this.stack[_this.index++];

          if (!fn) {
            return;
          }

          _this.__call(fn, next, err);
        };

        next();
      }
      /**
       * execute every plugin funciton
       * @param fn the plugin funciton
       * @param err error
       * @param next next plugin function
       */

    }, {
      key: "__call",
      value: function __call(fn, next, err) {
        //  catch error to next
        try {
          if (err && fn.length === 3) {
            fn(err, this.source, next);
            return;
          }

          if (!err && fn.length < 3) {
            fn(this.source, next);
            return;
          }
        } catch (e) {
          err = e; //  eslint-disable-line
        }

        next(err);
      }
    }]);

    return _default;
  }();

  var parseHeaders = function parseHeaders(headers) {
    var parsed = {};
    var ignoreDuplicateOf = ['age', 'authorization', 'content-length', 'content-type', 'etag', 'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since', 'last-modified', 'location', 'max-forwards', 'proxy-authorization', 'referer', 'retry-after', 'user-agent'];

    if (headers) {
      headers.split('\n').forEach(function (line) {
        var i = line.indexOf(':');
        var key = line.substr(0, i).trim().toLowerCase();
        var val = line.substr(i + 1).trim();

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) > -1) {
            return;
          }

          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? "".concat(parsed[key], ", ").concat(val) : val;
          }
        }
      });
    }

    return parsed;
  };
  var extend = function extend() {
    var obj = {};

    for (var i = 0; i < arguments.length; i++) {
      var source = i < 0 || arguments.length <= i ? undefined : arguments[i];

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
  var isUndefined = function isUndefined(obj) {
    return obj === void 0;
  };
  var getQuery = function getQuery(obj) {
    var query = '';

    if (!isObject(obj) || !Object.keys(obj).length) {
      return query;
    }

    Object.keys(obj).forEach(function (key) {
      var str = isUndefined(obj[key]) ? '' : "&".concat(key, "=").concat(obj[key]);
      query += str;
    });
    return query.replace('&', '?');
  };
  var promiseRace = function promiseRace(promise, n) {
    return __awaiter(void 0, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var i;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              i = 0;

            case 1:
              if (!(i < n)) {
                _context.next = 15;
                break;
              }

              _context.prev = 2;
              _context.next = 5;
              return promise();

            case 5:
              return _context.abrupt("return", _context.sent);

            case 8:
              _context.prev = 8;
              _context.t0 = _context["catch"](2);

              if (!(i === n - 1)) {
                _context.next = 12;
                break;
              }

              return _context.abrupt("return", Promise.reject(_context.t0));

            case 12:
              i++;
              _context.next = 1;
              break;

            case 15:
              return _context.abrupt("return", promise());

            case 16:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[2, 8]]);
    }));
  };
  var getPlugins = function getPlugins(base, extra) {
    var plugins = _toConsumableArray(base);

    extra.forEach(function (item) {
      return plugins.splice.apply(plugins, [item.sequence || plugins.length, 0].concat(_toConsumableArray(item.plugins)));
    });
    return plugins;
  };

  var Ajax = /*#__PURE__*/function () {
    function Ajax(config) {
      _classCallCheck(this, Ajax);

      this.requestPlugins = [];
      this.responsePlugins = [];
      this.config = config;
    }
    /**
     * Request in XMLHttprequest
     *
     * @param {meta.AjaxOption} options configs
     * @param {meta.AjaxOption.String} options.method request method
     * @param {meta.AjaxOption.String} options.url request url
     * @param {meta.AjaxOption.any} options.data request data
     * @param {meta.AjaxOption.Object} options.headers request headers
     * @param {meta.AjaxOption.Number} options.timeout request timeout
     * @param {meta.AjaxOption.Func} options.validateStatus response validateStatus
     * @param {meta.AjaxOption.String} options.responseType response responseType
     * @param {meta.AjaxOption.AbortSignal} options.signal abort signal
     * @param {meta.AjaxOption.Bool} options.withCredentials request cors
     * @param {meta.AjaxOption.Func} options.onDownloadProgress download progress
     * @param {meta.AjaxOption.Func} options.onUploadProgress upload progress
     * @param {meta.AjaxOption.Func} options.onabort abort handler
     * @param {meta.AjaxOption.Func} options.onerror error handler
     * @param {meta.AjaxOption.Func} options.ontimeout timeout handler
     *
     * @return {meta.requseter}
     */


    _createClass(Ajax, [{
      key: "request",
      value: function request(config) {
        var _this = this;

        var current = this.__current || 'get';
        var currentRequestPlugins = this["".concat(current, "requestPlugins")] || [];
        var currentResponsePlugins = this["".concat(current, "responsePlugins")] || [];
        var requestHandler = new _default(getPlugins(this.requestPlugins, currentRequestPlugins));
        var responseHandler = new _default(getPlugins(this.responsePlugins, currentResponsePlugins)); //  Clear the current

        this.__current = '';
        return new Promise(function (resolve, reject) {
          //  response handler
          var resultHandler = function resultHandler(xhr, opt) {
            // Prepare the response
            var responseHeaders = parseHeaders(xhr.getAllResponseHeaders());
            var responseData = !config.responseType || config.responseType === 'text' || config.responseType === 'json' ? xhr.responseText : xhr.response;
            var response = {
              data: responseData,
              status: xhr.status === 1223 ? 204 : xhr.status,
              statusText: xhr.status === 1223 ? 'No Content' : xhr.statusText,
              headers: responseHeaders,
              config: opt,
              request: xhr
            }; //  use plugin to handle response

            responseHandler.use(function (res) {
              responseHandler.abort();

              if (opt.validateStatus && opt.validateStatus(res.status)) {
                resolve(res.data);
              } else {
                reject(res.data);
              }
            }); //  to handle response plugins

            responseHandler.handle(response);
          };

          var options = extend({
            method: 'GET',
            url: ''
          }, _this.config, config);
          options.headers = options.headers || {};

          if (options.validateStatus) {
            options.validateStatus = options.validateStatus;
          } else {
            options.validateStatus = function (status) {
              return status >= 200 && status <= 300;
            };
          } //  to handle request plugins


          requestHandler.handle(options);
          var xhr = new XMLHttpRequest();
          xhr.open(options.method.toUpperCase(), options.url, true); // Set timeout handler

          xhr.timeout = options.timeout || 0; //  Use onloadend to handle result
          //  IE & Edge may not support

          if (!isUndefined(xhr.onloadend)) {
            xhr.onloadend = function () {
              return resultHandler(xhr, options);
            };
          } else {
            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                resultHandler(xhr, options);
              }
            };
          } // Handle abort


          xhr.onabort = options.onabort || null; // Handle low level network errors

          xhr.onerror = options.onerror || null; // Handle timeout

          xhr.ontimeout = options.ontimeout || null; // Add headers to the request

          Object.keys(options.headers).forEach(function (key) {
            if (typeof options.data === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete options.headers[key];
            } else {
              // Otherwise add header to the request
              xhr.setRequestHeader(key, options.headers[key]);
            }
          }); // Add withCredentials to request if needed

          if (options.withCredentials) {
            xhr.withCredentials = true;
          } // Add responseType to request if needed


          if (options.responseType) {
            xhr.responseType = options.responseType;
          } // Handle progress if needed


          if (typeof options.onDownloadProgress === 'function') {
            xhr.addEventListener('progress', options.onDownloadProgress);
          } // Not all browsers support upload events


          if (typeof options.onUploadProgress === 'function' && xhr.upload) {
            xhr.upload.addEventListener('progress', options.onUploadProgress);
          } // Abort the request if the signal is aborted


          if (options.signal && typeof options.signal.addEventListener === 'function') {
            options.signal.addEventListener('abort', function () {
              xhr.abort();
            });
          } // Send the request


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
  var request = (function () {
    return function (req, next) {
      //  set default request headers
      req.headers = req.headers || {};

      if (isObject(req.data) && !(req.data instanceof FormData)) {
        req.headers['Content-Type'] = 'application/json;charset=utf-8';
        req.data = JSON.stringify(req.data);
      } //  set requester info


      req.headers['X-Request-By'] = 'RestClient'; //  set csrftoken

      req.headers.csrftoken = new Date().getTime(); //  to handle next plugin

      next();
    };
  });

  /**
   * a response plugin
   *
   * @file src/plugins/response.js
   * @author helianthuswhite(hyz19960229@gmail.com)
   */
  var response = (function () {
    return function (res, next) {
      if (typeof res.data === 'string') {
        try {
          res.data = JSON.parse(res.data);
        } catch (e) {
          /* Ignore */
        }
      }

      next();
    };
  });

  /**
   * a response plugin
   *
   * @file src/plugins/response.js
   * @author helianthuswhite(hyz19960229@gmail.com)
   */
  /* eslint-disable arrow-body-style */

  var retry = (function (condition, times) {
    return function (res, next) {
      return __awaiter(void 0, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var config, status, ajax, executable;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                config = res.config, status = res.status;
                ajax = new Ajax();
                ajax.responsePlugins.push(response());
                executable = condition ? condition(res) : !config.validateStatus(status);

                if (!executable) {
                  _context.next = 15;
                  break;
                }

                _context.prev = 5;
                _context.next = 8;
                return promiseRace(ajax.request.bind(ajax, config), times);

              case 8:
                res.data = _context.sent;
                res.status = 200;
                _context.next = 15;
                break;

              case 12:
                _context.prev = 12;
                _context.t0 = _context["catch"](5);
                res.data = _context.t0;

              case 15:
                next();

              case 16:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[5, 12]]);
      }));
    };
  });

  /**
   * Main entry
   *
   * @file src/index.js
   * @author helianthuswhite(hyz19960229@gmail.com)
   */
  var plugins = {
    retry: retry,
    request: request,
    response: response
  }; // # sourceMappingURL=index.js.map

  /**
   * Provide the use decorator to use a plugin
   *
   * @file src/decorators/use.js
   * @author helianthuswhite(hyz19960229@gmail.com)
   */

  /* eslint-disable arrow-body-style */
  var use = (function (type, plugin, sequence) {
    return function (target, key, descriptor) {
      if (['req', 'request', 'res', 'response'].indexOf(type) === -1) {
        throw new Error('Plugin type is valid!');
      }

      var pluginType = type === 'req' || type === 'request' ? 'requestPlugins' : 'responsePlugins';
      var targetPlugins = typeof plugin === 'function' ? [plugin] : _toConsumableArray(plugin);

      if (typeof target === 'function') {
        return /*#__PURE__*/function (_target) {
          _inherits(_class, _target);

          var _super = _createSuper(_class);

          function _class(config) {
            var _this$pluginType;

            var _this;

            _classCallCheck(this, _class);

            _this = _super.call(this, config);

            (_this$pluginType = _this[pluginType]).splice.apply(_this$pluginType, [sequence || _this[pluginType].length, 0].concat(_toConsumableArray(targetPlugins)));

            return _this;
          }

          return _class;
        }(target);
      }

      if (target["__".concat(key, "__").concat(pluginType)]) {
        target["__".concat(key, "__").concat(pluginType)].push({
          plugins: targetPlugins,
          sequence: sequence
        });
      } else {
        Object.defineProperty(target, "__".concat(key, "__").concat(pluginType), {
          value: [{
            plugins: targetPlugins,
            sequence: sequence
          }]
        });
      }

      var fn = descriptor.value;
      Object.defineProperty(descriptor, 'value', {
        value: function value() {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return target.__decoratorMiddleware.apply(this, [fn, "__".concat(key, "__")].concat(args));
        }
      });
      return undefined;
    };
  });

  /**
   * Provide the timeout decorator
   *
   * @file src/decorators/retry.js
   * @author helianthuswhite(hyz19960229@gmail.com)
   */
  /* eslint-disable arrow-body-style */

  var timeout = (function () {
    var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 15 * 1000;
    return function (target, key, descriptor) {
      use('request', function (req, next) {
        req.timeout = timeout;
        next();
      })(target, key, descriptor);
    };
  });

  /**
   * Provide the retry decorator
   *
   * @file src/decorators/retry.js
   * @author helianthuswhite(hyz19960229@gmail.com)
   */
  var retry$1 = plugins.retry;
  /* eslint-disable arrow-body-style */

  var retry$2 = (function () {
    var times = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
    var timeout$1 = arguments.length > 1 ? arguments[1] : undefined;
    var condition = arguments.length > 2 ? arguments[2] : undefined;
    return function (target, key, descriptor) {
      timeout(timeout$1)(target, key, descriptor);
      use('response', retry$1(condition, times), 1)(target, key, descriptor);
    };
  });

  /**
   * Main entry
   *
   * @file src/index.js
   * @author helianthuswhite(hyz19960229@gmail.com)
   */
  var decorators = {
    use: use,
    retry: retry$2,
    timeout: timeout
  }; // # sourceMappingURL=index.js.map

  var requestPlugin = plugins.request,
      responsePlugin = plugins.response;
  var use$1 = decorators.use;

  var RestClient = /*#__PURE__*/function (_Ajax) {
    _inherits(RestClient, _Ajax);

    var _super = _createSuper(RestClient);

    function RestClient() {
      _classCallCheck(this, RestClient);

      return _super.apply(this, arguments);
    }

    _createClass(RestClient, [{
      key: "__bulkRequest",
      value: function __bulkRequest(url, method) {
        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var querys = arguments.length > 3 ? arguments[3] : undefined;
        var data = arguments.length > 4 ? arguments[4] : undefined;
        var options = extend({
          url: url,
          method: method
        }, config);

        if (querys) {
          options.url += getQuery(querys);
        }

        if (data) {
          options.data = data;
        }

        return this.request(options);
      }
    }, {
      key: "head",
      value: function head(url) {
        var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return this.__bulkRequest(url, 'head', config);
      }
    }, {
      key: "options",
      value: function options(url) {
        var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return this.__bulkRequest(url, 'options', config);
      }
    }, {
      key: "patch",
      value: function patch(url, data) {
        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return this.__bulkRequest(url, 'patch', config, undefined, data);
      }
    }, {
      key: "get",
      value: function get(url, querys) {
        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return this.__bulkRequest(url, 'get', config, querys);
      }
    }, {
      key: "delete",
      value: function _delete(url, querys) {
        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return this.__bulkRequest(url, 'delete', config, querys);
      }
    }, {
      key: "post",
      value: function post(url, data) {
        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return this.__bulkRequest(url, 'post', config, undefined, data);
      }
    }, {
      key: "put",
      value: function put(url, data) {
        var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return this.__bulkRequest(url, 'put', config, undefined, data);
      }
    }, {
      key: "__decoratorMiddleware",
      value: function __decoratorMiddleware(fn, key) {
        this.__current = key;

        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }

        return fn.apply(this, args);
      }
    }]);

    return RestClient;
  }(Ajax);

  RestClient = __decorate([use$1('request', requestPlugin()), use$1('response', responsePlugin())], RestClient);
  var RestClient$1 = RestClient;

  exports.Ajax = Ajax;
  exports.Client = RestClient$1;
  exports.decorators = decorators;
  exports.plugins = plugins;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=index.js.map
