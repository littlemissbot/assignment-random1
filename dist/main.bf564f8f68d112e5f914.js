/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");
var transitionalDefaults = __webpack_require__(/*! ../defaults/transitional */ "./node_modules/axios/lib/defaults/transitional.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || transitionalDefaults;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults/index.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
axios.VERSION = (__webpack_require__(/*! ./env/data */ "./node_modules/axios/lib/env/data.js").version);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ "./node_modules/axios/lib/helpers/isAxiosError.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var validator = __webpack_require__(/*! ../helpers/validator */ "./node_modules/axios/lib/helpers/validator.js");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(configOrUrl, config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof configOrUrl === 'string') {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults/index.js");
var Cancel = __webpack_require__(/*! ../cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults/index.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults/index.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/defaults/index.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ../helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");
var enhanceError = __webpack_require__(/*! ../core/enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");
var transitionalDefaults = __webpack_require__(/*! ./transitional */ "./node_modules/axios/lib/defaults/transitional.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ../adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ../adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: transitionalDefaults,

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ "./node_modules/axios/lib/defaults/transitional.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/defaults/transitional.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


module.exports = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};


/***/ }),

/***/ "./node_modules/axios/lib/env/data.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/env/data.js ***!
  \********************************************/
/***/ ((module) => {

module.exports = {
  "version": "0.26.1"
};

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAxiosError.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/validator.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/validator.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(/*! ../env/data */ "./node_modules/axios/lib/env/data.js").version);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return Array.isArray(val);
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return toString.call(val) === '[object FormData]';
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return toString.call(val) === '[object URLSearchParams]';
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ "./src/modules/app.js":
/*!****************************!*\
  !*** ./src/modules/app.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ App)
/* harmony export */ });
/* harmony import */ var _styles_app_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../styles/app.scss */ "./src/styles/app.scss");
/* harmony import */ var _assets_logo_png__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../assets/logo.png */ "./src/assets/logo.png");
/* harmony import */ var _assets_banner_bg_png__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../assets/banner-bg.png */ "./src/assets/banner-bg.png");
/* harmony import */ var _assets_information_image_png__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../assets/information-image.png */ "./src/assets/information-image.png");
/* harmony import */ var _team__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./team */ "./src/modules/team.js");
// import style assets
 // import image assets



 // import additional modules


function App() {
  // attach image assets
  // LOGO IMAGE ASSETS
  var logoTag = document.getElementsByClassName('brand-logo');
  logoTag[0].src = _assets_logo_png__WEBPACK_IMPORTED_MODULE_1__; // BANNER IMAGE ASSETS

  var bannerTag = document.getElementsByClassName('banner-image');
  bannerTag[0].src = _assets_banner_bg_png__WEBPACK_IMPORTED_MODULE_2__; // INFORMATION IMAGE ASSETS

  var informationTag = document.getElementsByClassName('information-image');
  var informationImageTag = informationTag[0].getElementsByTagName('img');
  informationImageTag[0].src = _assets_information_image_png__WEBPACK_IMPORTED_MODULE_3__; // attach click event to team load button

  var loadMembersButton = document.getElementById('load-members');

  loadMembersButton.onclick = function () {
    (0,_team__WEBPACK_IMPORTED_MODULE_4__["default"])(loadMembersButton.dataset.filter, parseInt(loadMembersButton.dataset.page) + 1, loadMembersButton.dataset.limit);
    loadMembersButton.dataset.page = parseInt(loadMembersButton.dataset.page) + 1;
  }; // attach click event to team filters


  var teamFilterTag = document.getElementsByClassName('team-filter')[0];
  teamFilterTag.querySelectorAll("li").forEach(function (e) {
    e.onclick = function () {
      // remove current active filter
      teamFilterTag.getElementsByClassName("active")[0].classList.remove('active'); // show current active filter and team members

      if (e.dataset.tag === "all") {
        e.classList.add('active');

        var _loadMembersButton = document.getElementById('load-members');

        (0,_team__WEBPACK_IMPORTED_MODULE_4__["default"])(null, 1, _loadMembersButton.dataset.limit);
        _loadMembersButton.dataset.page = 1; // DEPRECATED: logic below
        // manupulation dom to hide and show dom elements
        // document.querySelectorAll('.team-box').forEach(function(el) {
        //   el.style.display = 'block';
        // });
      } else {
        e.classList.add('active');

        var _loadMembersButton2 = document.getElementById('load-members');

        (0,_team__WEBPACK_IMPORTED_MODULE_4__["default"])(e.dataset.tag, 1, _loadMembersButton2.dataset.limit);
        _loadMembersButton2.dataset.page = 1;
        _loadMembersButton2.dataset.filter = e.dataset.tag; // DEPRECATED: logic below
        // manupulation dom to hide and show dom elements
        // document.querySelectorAll('.team-box').forEach(function(el) {
        //   el.style.display = 'none';
        // });
        // document.querySelectorAll(".tag-" + e.dataset.tag).forEach(function(el) {
        //   el.style.display = 'block';
        // });
      }
    };
  }); // initialize teams with min 5 members during start

  (0,_team__WEBPACK_IMPORTED_MODULE_4__["default"])();
  console.log("Inizialising App...");
}

/***/ }),

/***/ "./src/modules/team.js":
/*!*****************************!*\
  !*** ./src/modules/team.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Team)
/* harmony export */ });
// import plugins [needed]
var axios = __webpack_require__(/*! axios */ "./node_modules/axios/index.js");

function Team(duty) {
  var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;
  // api call to fetch team members
  axios.get("https://challenge-api.view.agentur-loop.com/api.php", {
    params: {
      page: page,
      limit: limit,
      duty: duty !== "" ? duty : null
    }
  }).then(function (response) {
    // handle success
    console.log(response.data.data.data);
    var records = response.data.data.data;
    var teamTag = document.getElementById('team-members');
    if (page == 1) teamTag.innerHTML = ''; // read and append each team member to parent element

    records.forEach(function (e) {
      var teamMemberTag = TeamTemplate(e);
      teamTag.appendChild(teamMemberTag);
    });
  })["catch"](function (error) {
    // handle error
    console.log(error);
  });
}

function TeamTemplate(params) {
  // create one team member's parent element
  var Root = document.createElement("div");
  Root.classList.add("team-box");
  params.duty_slugs.forEach(function (e) {
    Root.classList.add("tag-" + e);
  });
  Root.dataset.tags = params.duty_slugs.toString(); // create one team member's image

  var Image = document.createElement("img");
  Image.src = params.image; // create one team member's name and description

  var Caption = document.createElement("div");
  Caption.classList.add("team-caption");
  var CaptionName = document.createElement("h2");
  CaptionName.classList.add("name");
  CaptionName.textContent = params.name;
  var CaptionDescription = document.createElement("p");
  CaptionDescription.classList.add("description");
  CaptionDescription.textContent = "A smooth sea never made a skilled sailor.";
  Caption.appendChild(CaptionName);
  Caption.appendChild(CaptionDescription); // append image and caption to team member's parent element

  Root.appendChild(Image);
  Root.appendChild(Caption); // returning DOM element with one team member

  return Root;
}

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/styles/app.scss":
/*!**********************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/styles/app.scss ***!
  \**********************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.push([module.id, "@import url(https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;600;800&display=swap);"]);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "/* VARIABLES */\nbody {\n  font-family: \"Plus Jakarta Sans\", sans-serif;\n  font-size: 14px;\n  font-weight: 300;\n  background-color: #E5EAEE;\n  margin: 0;\n  padding: 0;\n}\n\n/* RESET TYPOGRAPHY */\nh1, h2, h3, h4 {\n  font-weight: 800;\n}\n\nh5, h6 {\n  font-weight: 600;\n}\n\n.title {\n  font-size: 2em;\n  text-transform: uppercase;\n  color: #FC0000;\n  margin: 0.25em 0;\n}\n\n.subtitle {\n  font-size: 1.25em;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 1px;\n  margin: 0;\n}\n\n.para {\n  letter-spacing: 0.25px;\n  line-height: 1.5;\n  color: #909090;\n}\n\n.divider {\n  width: 20%;\n  margin: 1em auto 2em;\n}\n\n.page-wrapper {\n  max-width: 100em;\n  margin: auto;\n}\n\n.column-2 {\n  column-count: 2;\n  column-fill: auto;\n}\n\n.column-5 {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;\n}\n\n/* HEADER */\nheader {\n  background-color: #FFFFFF;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n}\nheader .brand-logo {\n  max-height: 4.25em;\n  order: 2;\n}\nheader .navbar-button {\n  font-size: 1.25em;\n  background-color: #FFFFFF;\n  color: #222222;\n  border: 2px solid #222222;\n  display: none;\n  padding: 0.5em 1em;\n}\nheader .navbar {\n  font-size: 1em;\n  font-weight: 600;\n  text-transform: uppercase;\n  order: 1;\n}\nheader .navbar ul {\n  list-style: none;\n  display: inline-flex;\n  margin: 0;\n  padding: 0;\n}\nheader .navbar ul li a {\n  text-decoration: none;\n  color: #222222;\n  display: block;\n  padding: 1em;\n}\nheader .navbar ul li a:hover {\n  color: #FC0000;\n}\n@media only screen and (max-width: 540px) {\n  header .brand-logo {\n    order: 0;\n  }\n  header .navbar-button {\n    display: block;\n  }\n  header .navbar-button:hover ~ .navbar ul {\n    display: flex;\n  }\n  header .navbar {\n    position: relative;\n  }\n  header .navbar ul {\n    background-color: #FFFFFF;\n    position: absolute;\n    top: 2em;\n    right: 0;\n    z-index: 1;\n    min-width: 300px;\n    display: none;\n    flex-direction: column;\n  }\n}\n\n/* BANNER */\nsection.banner-section {\n  position: relative;\n}\nsection.banner-section .banner-image {\n  width: 100%;\n  height: 50em;\n  object-fit: cover;\n}\nsection.banner-section .banner-caption {\n  text-align: right;\n  position: absolute;\n  top: 15%;\n  right: 0;\n  width: 50%;\n  margin: 2em;\n}\nsection.banner-section .banner-caption .title {\n  font-size: 3em;\n}\n@media only screen and (max-width: 820px) {\n  section.banner-section .banner-caption {\n    width: 80%;\n  }\n  section.banner-section .banner-image {\n    height: 40em;\n  }\n}\n\n/* NEWS */\nsection.news-section {\n  display: flex;\n}\nsection.news-section .news-box {\n  padding: 2em;\n  display: flex;\n  flex-direction: column;\n  justify-content: flex-end;\n}\nsection.news-section .news-box.news-box-dark {\n  background-color: #222222;\n}\nsection.news-section .news-box.news-box-dark .para {\n  color: #E5EAEE;\n}\nsection.news-section .news-box.news-box-sm {\n  position: relative;\n}\nsection.news-section .news-box.news-box-sm::before {\n  background-color: #E5EAEE;\n  content: \"\";\n  width: 100%;\n  height: 25%;\n  position: absolute;\n  left: 0;\n  top: -18%;\n  transform: skewY(5deg);\n}\nsection.news-section .news-box.news-box-dark.news-box-sm::before {\n  background-color: #222222;\n  height: 20%;\n  top: -7%;\n}\nsection.news-section .news-box.news-box-lg {\n  background-repeat: no-repeat;\n  background-size: cover;\n}\nsection.news-section .news-box.news-box-lg .news-date {\n  font-size: 2.5em;\n  color: #222222;\n}\nsection.news-section .news-box .news-date {\n  font-weight: 600;\n  text-transform: uppercase;\n  color: #909090;\n  margin: 0;\n}\n@media only screen and (max-width: 1260px) {\n  section.news-section .news-box.news-box-sm::before {\n    transform: skewY(6deg);\n  }\n}\n@media only screen and (max-width: 820px) {\n  section.news-section .news-box.news-box-sm::before {\n    transform: skewY(10deg);\n  }\n}\n@media only screen and (max-width: 540px) {\n  section.news-section {\n    flex-wrap: wrap;\n  }\n  section.news-section .news-box-sm::before {\n    display: none;\n  }\n}\n\n/* INFORMATION */\nsection.information-section {\n  background-color: #FFFFFF;\n  padding: 6em 0em 6em;\n}\nsection.information-section .title,\nsection.information-section .subtitle {\n  text-align: center;\n}\nsection.information-section .information-gap {\n  padding-left: 10em;\n  padding-right: 10em;\n}\nsection.information-section .information-image {\n  position: relative;\n  z-index: 4;\n  transform: skewY(-10deg);\n}\nsection.information-section .information-image img {\n  position: absolute;\n  top: 20%;\n  right: 40%;\n  transform: skewY(10deg);\n}\n@media only screen and (max-width: 820px) {\n  section.information-section .information-gap {\n    padding-left: 2em;\n    padding-right: 2em;\n  }\n}\n\n/* TEAMS */\nsection.team-section {\n  background-color: #222222;\n  position: relative;\n  z-index: 3;\n  padding: 6em 2em;\n}\nsection.team-section::before {\n  background-color: #222222;\n  content: \"\";\n  width: 100%;\n  height: 130px;\n  position: absolute;\n  left: 0;\n  top: -65px;\n  transform: skewY(-5deg);\n}\nsection.team-section .title,\nsection.team-section .subtitle {\n  text-align: center;\n  color: #FFFFFF;\n}\nsection.team-section .team-filter {\n  font-size: 1em;\n  font-weight: 600;\n  text-align: center;\n  text-transform: uppercase;\n  color: #FFFFFF;\n  margin: 0 0 2em;\n}\nsection.team-section .team-filter ul {\n  list-style: none;\n  display: inline-flex;\n  margin: 0;\n  padding: 0;\n}\nsection.team-section .team-filter ul li {\n  padding: 1em;\n}\nsection.team-section .team-filter ul li:hover {\n  cursor: pointer;\n}\nsection.team-section .team-filter ul li.active {\n  border-bottom: 2px solid #FFFFFF;\n}\nsection.team-section .team-box {\n  position: relative;\n}\nsection.team-section .team-box img {\n  width: 100%;\n  height: auto;\n  object-fit: cover;\n  filter: grayscale(1);\n  transition: 1s filter;\n}\nsection.team-section .team-box img:hover {\n  filter: grayscale(0);\n  transition: 1s filter;\n}\nsection.team-section .team-box:hover .team-caption {\n  opacity: 1;\n  visibility: visible;\n  left: 0;\n  animation: ease-in;\n  animation-name: moveRight;\n  animation-duration: 2s;\n  transition: 2s opacity;\n}\nsection.team-section .team-box:nth-of-type(5n):hover .team-caption {\n  opacity: 1;\n  visibility: visible;\n  left: -200%;\n  animation: ease-in;\n  animation-name: moveLeft;\n  animation-duration: 2s;\n  transition: 2s opacity;\n}\nsection.team-section .team-caption {\n  background-color: #E5EAEE;\n  opacity: 0;\n  visibility: hidden;\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: none;\n  right: 0;\n  z-index: 1;\n  width: 90%;\n  display: flex;\n  flex-direction: column;\n  justify-content: flex-end;\n  padding: 1em;\n  margin-left: 100%;\n}\nsection.team-section .team-caption .name {\n  margin: 0 0 0.5em;\n}\nsection.team-section .team-caption .description {\n  margin: 0;\n}\nsection.team-section .team-button {\n  text-align: center;\n}\nsection.team-section .team-button button {\n  font-weight: 600;\n  text-transform: uppercase;\n  background-color: transparent;\n  color: #FFFFFF;\n  border: 2px solid #FFFFFF;\n  padding: 1em 2em;\n  margin: 4em 0 0;\n  transition: 0.5s background-color, 0.5s color;\n}\nsection.team-section .team-button button:hover {\n  background-color: #FFFFFF;\n  color: #222222;\n  transition: 0.5s background-color, 0.5s color;\n  cursor: pointer;\n}\n@media only screen and (max-width: 820px) {\n  section.team-section .team-box:nth-of-type(5n):hover .team-caption {\n    opacity: 1;\n    visibility: visible;\n    left: 0;\n    animation: ease-in;\n    animation-name: moveRight;\n    animation-duration: 2s;\n    transition: 2s opacity;\n  }\n  section.team-section .team-box:nth-of-type(3n):hover .team-caption {\n    opacity: 1;\n    visibility: visible;\n    left: -200%;\n    animation: ease-in;\n    animation-name: moveLeft;\n    animation-duration: 2s;\n    transition: 2s opacity;\n  }\n}\n@media only screen and (max-width: 540px) {\n  section.team-section .team-box:nth-of-type(5n):hover .team-caption,\nsection.team-section .team-box:nth-of-type(3n):hover .team-caption,\nsection.team-section .team-box:hover .team-caption {\n    opacity: 1;\n    visibility: visible;\n    left: -100%;\n    bottom: -100%;\n    top: 100%;\n    width: 92%;\n    animation: ease-in;\n    animation-name: moveBottom;\n    animation-duration: 2s;\n    transition: 2s opacity;\n  }\n  section.team-section .team-box:last-child:hover .team-caption {\n    opacity: 1;\n    visibility: visible;\n    left: -100%;\n    bottom: 100%;\n    top: -100%;\n    width: 92%;\n    animation: ease-in;\n    animation-name: moveTop;\n    animation-duration: 2s;\n    transition: 2s opacity;\n  }\n}\n\n/* FOOTER */\nfooter {\n  background-color: #FFFFFF;\n  display: flex;\n  justify-content: space-between;\n  padding: 4em 1em;\n}\nfooter .copyrights {\n  margin: 0;\n}\nfooter nav ul {\n  list-style: none;\n  display: flex;\n  margin: 0;\n  padding: 0;\n}\nfooter nav ul li a {\n  text-decoration: none;\n  color: #222222;\n  display: block;\n  padding: 0 0.5em;\n}\nfooter nav ul li a:hover {\n  color: #FC0000;\n}\nfooter nav ul .icon {\n  font-size: 1.5em;\n}\n@media only screen and (max-width: 820px) {\n  footer {\n    justify-content: center;\n    align-items: center;\n    flex-direction: column;\n  }\n  footer nav ul {\n    margin-top: 2em;\n  }\n}\n\n/* MEDIA QUERIES */\n@media only screen and (max-width: 820px) {\n  .column-5 {\n    grid-template-columns: 1fr 1fr 1fr;\n  }\n}\n@media only screen and (max-width: 540px) {\n  .column-5 {\n    grid-template-columns: 1fr;\n  }\n}\n/* ANIMATIONS */\n@keyframes moveRight {\n  0% {\n    left: -100%;\n  }\n  100% {\n    left: 0;\n  }\n}\n@keyframes moveLeft {\n  0% {\n    left: -100%;\n  }\n  100% {\n    left: -200%;\n  }\n}\n@keyframes moveBottom {\n  0% {\n    bottom: 0;\n    top: 0;\n  }\n  100% {\n    bottom: -100%;\n    top: 100%;\n  }\n}\n@keyframes moveTop {\n  0% {\n    bottom: 0;\n    top: 0;\n  }\n  100% {\n    bottom: 100%;\n    top: -100%;\n  }\n}", "",{"version":3,"sources":["webpack://./src/styles/app.scss"],"names":[],"mappings":"AAEA,cAAA;AAgBA;EACE,4CAAA;EACA,eAAA;EACA,gBAPU;EASV,yBAfU;EAiBV,SAAA;EACA,UAAA;AAjBF;;AAoBA,qBAAA;AACA;EACE,gBAfW;AAFb;;AAmBA;EACE,gBAnBS;AAGX;;AAkBA;EACE,cAAA;EACA,yBAAA;EAEA,cAjCa;EAmCb,gBAAA;AAjBF;;AAmBA;EACE,iBAAA;EACA,gBA/BS;EAgCT,yBAAA;EACA,mBAAA;EAEA,SAAA;AAjBF;;AAmBA;EACE,sBAAA;EACA,gBAAA;EAEA,cA/CW;AA8Bb;;AAoBA;EACE,UAAA;EAEA,oBAAA;AAlBF;;AAqBA;EACE,gBAAA;EACA,YAAA;AAlBF;;AAqBA;EACE,eAAA;EACA,iBAAA;AAlBF;;AAoBA;EACE,aAAA;EACA,0CAAA;AAjBF;;AAoBA,WAAA;AACA;EACE,yBAtEa;EAwEb,aAAA;EACA,mBAAA;EACA,8BAAA;AAlBF;AAoBE;EACE,kBAAA;EAEA,QAAA;AAnBJ;AAsBE;EACE,iBAAA;EAEA,yBArFW;EAsFX,cAvFO;EAyFP,yBAAA;EAEA,aAAA;EACA,kBAAA;AAvBJ;AA0BE;EACE,cAAA;EACA,gBA5FO;EA6FP,yBAAA;EAEA,QAAA;AAzBJ;AA2BI;EACE,gBAAA;EAEA,oBAAA;EACA,SAAA;EACA,UAAA;AA1BN;AA4BM;EACE,qBAAA;EAEA,cAhHG;EAkHH,cAAA;EACA,YAAA;AA5BR;AA+BM;EACE,cA1HO;AA6Ff;AAkCE;EACE;IACE,QAAA;EAhCJ;EAkCE;IACE,cAAA;EAhCJ;EAiCI;IACE,aAAA;EA/BN;EAkCE;IACE,kBAAA;EAhCJ;EAiCI;IACE,yBAxIO;IA0IP,kBAAA;IACA,QAAA;IACA,QAAA;IACA,UAAA;IAEA,gBAAA;IACA,aAAA;IACA,sBAAA;EAjCN;AACF;;AAsCA,WAAA;AACA;EACE,kBAAA;AAnCF;AAqCE;EACE,WAAA;EACA,YAAA;EACA,iBAAA;AAnCJ;AAsCE;EACE,iBAAA;EAEA,kBAAA;EACA,QAAA;EACA,QAAA;EAEA,UAAA;EACA,WAAA;AAtCJ;AAwCI;EACE,cAAA;AAtCN;AA0CE;EACE;IACE,UAAA;EAxCJ;EA0CE;IACE,YAAA;EAxCJ;AACF;;AA4CA,SAAA;AACA;EACE,aAAA;AAzCF;AA2CE;EACE,YAAA;EAEA,aAAA;EACA,sBAAA;EACA,yBAAA;AA1CJ;AA4CI;EACE,yBAvMK;AA6JX;AA4CM;EACE,cA5MI;AAkKZ;AA8CI;EACE,kBAAA;AA5CN;AA8CM;EACE,yBApNI;EAqNJ,WAAA;EACA,WAAA;EACA,WAAA;EAEA,kBAAA;EACA,OAAA;EACA,SAAA;EAEA,sBAAA;AA9CR;AAkDI;EACE,yBAhOK;EAkOL,WAAA;EACA,QAAA;AAjDN;AAoDI;EAEE,4BAAA;EACA,sBAAA;AAnDN;AAqDM;EACE,gBAAA;EAEA,cA9OG;AA0LX;AAwDI;EACE,gBA9OK;EA+OL,yBAAA;EAEA,cAvPO;EAyPP,SAAA;AAxDN;AA4DE;EACE;IACE,sBAAA;EA1DJ;AACF;AA6DE;EACE;IACE,uBAAA;EA3DJ;AACF;AA8DE;EACE;IACE,eAAA;EA5DJ;EA8DI;IACE,aAAA;EA5DN;AACF;;AAiEA,gBAAA;AACA;EACE,yBApRa;EAsRb,oBAAA;AA/DF;AAiEE;;EAEE,kBAAA;AA/DJ;AAkEE;EACE,kBAAA;EACA,mBAAA;AAhEJ;AAmEE;EACE,kBAAA;EACA,UAAA;EAEA,wBAAA;AAlEJ;AAoEI;EACE,kBAAA;EACA,QAAA;EACA,UAAA;EAEA,uBAAA;AAnEN;AAuEE;EACE;IACE,iBAAA;IACA,kBAAA;EArEJ;AACF;;AAyEA,UAAA;AACA;EACE,yBA5TS;EA8TT,kBAAA;EACA,UAAA;EACA,gBAAA;AAvEF;AAyEE;EACE,yBAnUO;EAoUP,WAAA;EACA,WAAA;EACA,aAAA;EAEA,kBAAA;EACA,OAAA;EACA,UAAA;EAEA,uBAAA;AAzEJ;AA4EE;;EAEE,kBAAA;EAEA,cAlVW;AAuQf;AA8EE;EACE,cAAA;EACA,gBAnVO;EAoVP,kBAAA;EACA,yBAAA;EAEA,cA3VW;EA6VX,eAAA;AA9EJ;AAgFI;EACE,gBAAA;EAEA,oBAAA;EACA,SAAA;EACA,UAAA;AA/EN;AAiFM;EACE,YAAA;AA/ER;AAkFM;EACE,eAAA;AAhFR;AAmFM;EACE,gCAAA;AAjFR;AAsFE;EACE,kBAAA;AApFJ;AAsFI;EACE,WAAA;EACA,YAAA;EACA,iBAAA;EAEA,oBAAA;EACA,qBAAA;AArFN;AAuFM;EACE,oBAAA;EACA,qBAAA;AArFR;AAyFI;EACE,UAAA;EACA,mBAAA;EACA,OAAA;EACA,kBAAA;EACA,yBAAA;EACA,sBAAA;EAEA,sBAAA;AAxFN;AA2FI;EACE,UAAA;EACA,mBAAA;EACA,WAAA;EACA,kBAAA;EACA,wBAAA;EACA,sBAAA;EAEA,sBAAA;AA1FN;AA8FE;EACE,yBAhaQ;EAiaR,UAAA;EACA,kBAAA;EAEA,kBAAA;EACA,MAAA;EACA,SAAA;EACA,UAAA;EACA,QAAA;EACA,UAAA;EAEA,UAAA;EACA,aAAA;EACA,sBAAA;EACA,yBAAA;EACA,YAAA;EACA,iBAAA;AA9FJ;AAgGI;EACE,iBAAA;AA9FN;AAiGI;EACE,SAAA;AA/FN;AAmGE;EACE,kBAAA;AAjGJ;AAmGI;EACE,gBAxbK;EAybL,yBAAA;EAEA,6BAAA;EACA,cAhcS;EAkcT,yBAAA;EAEA,gBAAA;EACA,eAAA;EAEA,6CAAA;AArGN;AAuGM;EACE,yBA1cO;EA2cP,cA5cG;EA8cH,6CAAA;EACA,eAAA;AAtGR;AA2GE;EACE;IACE,UAAA;IACA,mBAAA;IACA,OAAA;IACA,kBAAA;IACA,yBAAA;IACA,sBAAA;IAEA,sBAAA;EA1GJ;EA4GE;IACE,UAAA;IACA,mBAAA;IACA,WAAA;IACA,kBAAA;IACA,wBAAA;IACA,sBAAA;IAEA,sBAAA;EA3GJ;AACF;AA8GE;EACE;;;IAGE,UAAA;IACA,mBAAA;IACA,WAAA;IACA,aAAA;IACA,SAAA;IACA,UAAA;IACA,kBAAA;IACA,0BAAA;IACA,sBAAA;IAEA,sBAAA;EA7GJ;EA+GE;IACE,UAAA;IACA,mBAAA;IACA,WAAA;IACA,YAAA;IACA,UAAA;IACA,UAAA;IACA,kBAAA;IACA,uBAAA;IACA,sBAAA;IAEA,sBAAA;EA9GJ;AACF;;AAkHA,WAAA;AACA;EACE,yBA5gBa;EA8gBb,aAAA;EACA,8BAAA;EACA,gBAAA;AAhHF;AAkHE;EACE,SAAA;AAhHJ;AAmHE;EACE,gBAAA;EAEA,aAAA;EACA,SAAA;EACA,UAAA;AAlHJ;AAoHI;EACE,qBAAA;EAEA,cAjiBK;EAmiBL,cAAA;EACA,gBAAA;AApHN;AAuHI;EACE,cA3iBS;AAsbf;AAwHI;EACE,gBAAA;AAtHN;AA0HE;EACE;IACE,uBAAA;IACA,mBAAA;IACA,sBAAA;EAxHJ;EAyHI;IACE,eAAA;EAvHN;AACF;;AA4HA,kBAAA;AACA;EACE;IACE,kCAAA;EAzHF;AACF;AA4HA;EACE;IACE,0BAAA;EA1HF;AACF;AA6HA,eAAA;AACA;EACE;IACE,WAAA;EA3HF;EA6HA;IACE,OAAA;EA3HF;AACF;AA6HA;EACE;IACE,WAAA;EA3HF;EA6HA;IACE,WAAA;EA3HF;AACF;AA6HA;EACE;IACE,SAAA;IACA,MAAA;EA3HF;EA6HA;IACE,aAAA;IACA,SAAA;EA3HF;AACF;AA6HA;EACE;IACE,SAAA;IACA,MAAA;EA3HF;EA6HA;IACE,YAAA;IACA,UAAA;EA3HF;AACF","sourcesContent":["@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;600;800&display=swap');\n\n/* VARIABLES */\n$mediaMaxWidth: 1260px;\n$mediaBp1Width: 820px;\n$mediaMinWidth: 540px;\n\n$primaryColor: #FC0000;\n$baseLight: #E5EAEE;\n$baseMedium: #909090;\n$baseDark: #222222;\n$lighterColor: #FFFFFF;\n$darkerColor: #111111;\n\n$fontLight: 300;\n$fontBold: 600;\n$fontBolder: 800;\n\nbody {\n  font-family: 'Plus Jakarta Sans', sans-serif;\n  font-size: 14px;\n  font-weight: $fontLight;\n\n  background-color: $baseLight;\n\n  margin: 0;\n  padding: 0;\n}\n\n/* RESET TYPOGRAPHY */\nh1, h2, h3, h4 {\n  font-weight: $fontBolder;\n}\nh5, h6 {\n  font-weight: $fontBold;\n}\n.title {\n  font-size: 2em;\n  text-transform: uppercase;\n\n  color: $primaryColor;\n\n  margin: 0.25em 0;\n}\n.subtitle {\n  font-size: 1.25em;\n  font-weight: $fontBold;\n  text-transform: uppercase;\n  letter-spacing: 1px;\n\n  margin: 0;\n}\n.para {\n  letter-spacing: 0.25px;\n  line-height: 1.5;\n\n  color: $baseMedium;\n}\n\n.divider {\n  width: 20%;\n\n  margin: 1em auto 2em;\n}\n\n.page-wrapper {\n  max-width: 100em;\n  margin: auto;\n}\n\n.column-2 {\n  column-count: 2;\n  column-fill: auto\n}\n.column-5 {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;\n}\n\n/* HEADER */\nheader {\n  background-color: $lighterColor;\n\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n\n  .brand-logo {\n    max-height: 4.25em;\n  \n    order: 2;\n  }\n\n  .navbar-button {\n    font-size: 1.25em;\n  \n    background-color: $lighterColor;\n    color: $baseDark;\n  \n    border: 2px solid $baseDark;\n  \n    display: none;\n    padding: 0.5em 1em;\n  }\n\n  .navbar {\n    font-size: 1em;\n    font-weight: $fontBold;\n    text-transform: uppercase;\n  \n    order: 1;\n\n    ul {\n      list-style: none;\n    \n      display: inline-flex;\n      margin: 0;\n      padding: 0;\n\n      li a {\n        text-decoration: none;\n      \n        color: $baseDark;\n      \n        display: block;\n        padding: 1em;\n      }\n\n      li a:hover {\n        color: $primaryColor;\n      }\n    }\n  }\n\n  @media only screen and (max-width: $mediaMinWidth) {\n    .brand-logo {\n      order: 0;\n    }\n    .navbar-button {\n      display: block;\n      &:hover ~ .navbar ul {\n        display: flex;\n      }\n    }\n    .navbar {\n      position: relative;\n      ul {\n        background-color: $lighterColor;\n    \n        position: absolute;\n        top: 2em;\n        right: 0;\n        z-index: 1;\n    \n        min-width: 300px;\n        display: none;\n        flex-direction: column;\n      }\n    }\n  }\n}\n\n/* BANNER */\nsection.banner-section {\n  position: relative;\n\n  .banner-image {\n    width: 100%;\n    height: 50em;\n    object-fit: cover;\n  }\n\n  .banner-caption {\n    text-align: right;\n  \n    position: absolute;\n    top: 15%;\n    right: 0;\n  \n    width: 50%;\n    margin: 2em;\n\n    .title {\n      font-size: 3em;\n    }\n  }\n\n  @media only screen and (max-width: $mediaBp1Width) {\n    .banner-caption {\n      width: 80%;\n    }\n    .banner-image {\n      height: 40em;\n    }\n  }\n}\n\n/* NEWS */\nsection.news-section {\n  display: flex;\n\n  .news-box {\n    padding: 2em;\n  \n    display: flex;\n    flex-direction: column;\n    justify-content: flex-end;\n\n    &.news-box-dark {\n      background-color: $baseDark;\n\n      .para {\n        color: $baseLight;\n      }\n    }\n\n    &.news-box-sm {\n      position: relative;\n\n      &::before {\n        background-color: $baseLight;\n        content: \"\";\n        width: 100%;\n        height: 25%;\n      \n        position: absolute;\n        left: 0;\n        top: -18%;\n      \n        transform: skewY(5deg);\n      }\n    }\n\n    &.news-box-dark.news-box-sm::before {\n      background-color: $baseDark;\n\n      height: 20%;\n      top: -7%;\n    }\n\n    &.news-box-lg {\n      // background-image: url('../img/news-bg.png');\n      background-repeat: no-repeat;\n      background-size: cover;\n\n      .news-date {\n        font-size: 2.5em;\n      \n        color: $baseDark;\n      }\n    }\n\n    .news-date {\n      font-weight: $fontBold;\n      text-transform: uppercase;\n    \n      color: $baseMedium;\n    \n      margin: 0;\n    }\n  }\n\n  @media only screen and (max-width: $mediaMaxWidth) {\n    .news-box.news-box-sm::before {\n      transform: skewY(6deg);\n    }\n  }\n\n  @media only screen and (max-width: $mediaBp1Width) {\n    .news-box.news-box-sm::before {\n      transform: skewY(10deg);\n    }\n  }\n\n  @media only screen and (max-width: $mediaMinWidth) {\n    & {\n      flex-wrap: wrap;\n      \n      .news-box-sm::before {\n        display: none;\n      }\n    }\n  }\n}\n\n/* INFORMATION */\nsection.information-section {\n  background-color: $lighterColor;\n\n  padding: 6em 0em 6em;\n\n  .title,\n  .subtitle {\n    text-align: center;\n  }\n\n  .information-gap {\n    padding-left: 10em;\n    padding-right: 10em;\n  }\n\n  .information-image {\n    position: relative;\n    z-index: 4;\n  \n    transform: skewY(-10deg);\n\n    img {\n      position: absolute;\n      top: 20%;\n      right: 40%;\n    \n      transform: skewY(10deg);\n    }\n  }\n\n  @media only screen and (max-width: $mediaBp1Width) {\n    .information-gap {\n      padding-left: 2em;\n      padding-right: 2em;\n    }\n  }\n}\n\n/* TEAMS */\nsection.team-section {\n  background-color: $baseDark;\n\n  position: relative;\n  z-index: 3;\n  padding: 6em 2em;\n\n  &::before {\n    background-color: $baseDark;\n    content: \"\";\n    width: 100%;\n    height: 130px;\n  \n    position: absolute;\n    left: 0;\n    top: -65px;\n  \n    transform: skewY(-5deg);\n  }\n\n  .title,\n  .subtitle {\n    text-align: center;\n\n    color: $lighterColor;\n  }\n\n  .team-filter {\n    font-size: 1em;\n    font-weight: $fontBold;\n    text-align: center;\n    text-transform: uppercase;\n  \n    color: $lighterColor;\n  \n    margin: 0 0 2em;\n\n    ul {\n      list-style: none;\n    \n      display: inline-flex;\n      margin: 0;\n      padding: 0;\n\n      li {\n        padding: 1em;\n      }\n\n      li:hover {\n        cursor: pointer;\n      }\n\n      li.active {\n        border-bottom: 2px solid $lighterColor;\n      }\n    }\n  }\n\n  .team-box {\n    position: relative;\n\n    img {\n      width: 100%;\n      height: auto;\n      object-fit: cover;\n    \n      filter: grayscale(1);\n      transition: 1s filter;\n\n      &:hover {\n        filter: grayscale(0);\n        transition: 1s filter;\n      }\n    }\n\n    &:hover .team-caption {\n      opacity: 1;\n      visibility: visible;\n      left: 0;\n      animation: ease-in;\n      animation-name: moveRight;\n      animation-duration: 2s;\n    \n      transition: 2s opacity;\n    }\n\n    &:nth-of-type(5n):hover .team-caption {\n      opacity: 1;\n      visibility: visible;\n      left: -200%;\n      animation: ease-in;\n      animation-name: moveLeft;\n      animation-duration: 2s;\n    \n      transition: 2s opacity;\n    }\n  }\n\n  .team-caption {\n    background-color: $baseLight;\n    opacity: 0;\n    visibility: hidden;\n  \n    position: absolute;\n    top: 0;\n    bottom: 0;\n    left: none;\n    right: 0;\n    z-index: 1;\n  \n    width: 90%;\n    display: flex;\n    flex-direction: column;\n    justify-content: flex-end;\n    padding: 1em;\n    margin-left: 100%;\n\n    .name {\n      margin: 0 0 0.5em;\n    }\n\n    .description {\n      margin: 0;\n    }\n  }\n\n  .team-button {\n    text-align: center;\n\n    button {\n      font-weight: $fontBold;\n      text-transform: uppercase;\n    \n      background-color: transparent;\n      color: $lighterColor;\n    \n      border: 2px solid $lighterColor;\n    \n      padding: 1em 2em;\n      margin: 4em 0 0;\n    \n      transition: 0.5s background-color, 0.5s color;\n\n      &:hover {\n        background-color: $lighterColor;\n        color: $baseDark;\n      \n        transition: 0.5s background-color, 0.5s color;\n        cursor: pointer;\n      }\n    }\n  }\n\n  @media only screen and (max-width: $mediaBp1Width) {\n    .team-box:nth-of-type(5n):hover .team-caption {\n      opacity: 1;\n      visibility: visible;\n      left: 0;\n      animation: ease-in;\n      animation-name: moveRight;\n      animation-duration: 2s;\n\n      transition: 2s opacity;\n    }\n    .team-box:nth-of-type(3n):hover .team-caption {\n      opacity: 1;\n      visibility: visible;\n      left: -200%;\n      animation: ease-in;\n      animation-name: moveLeft;\n      animation-duration: 2s;\n\n      transition: 2s opacity;\n    }\n  }\n\n  @media only screen and (max-width: $mediaMinWidth) {\n    .team-box:nth-of-type(5n):hover .team-caption,\n    .team-box:nth-of-type(3n):hover .team-caption,\n    .team-box:hover .team-caption {\n      opacity: 1;\n      visibility: visible;\n      left: -100%;\n      bottom: -100%;\n      top: 100%;\n      width: 92%;\n      animation: ease-in;\n      animation-name: moveBottom;\n      animation-duration: 2s;\n\n      transition: 2s opacity;\n    }\n    .team-box:last-child:hover .team-caption {\n      opacity: 1;\n      visibility: visible;\n      left: -100%;\n      bottom: 100%;\n      top: -100%;\n      width: 92%;\n      animation: ease-in;\n      animation-name: moveTop;\n      animation-duration: 2s;\n\n      transition: 2s opacity;\n    }\n  }\n}\n\n/* FOOTER */\nfooter {\n  background-color: $lighterColor;\n\n  display: flex;\n  justify-content: space-between;\n  padding: 4em 1em;\n\n  .copyrights {\n    margin: 0;\n  }\n\n  nav ul {\n    list-style: none;\n  \n    display: flex;\n    margin: 0;\n    padding: 0;\n\n    li a {\n      text-decoration: none;\n    \n      color: $baseDark;\n      \n      display: block;\n      padding: 0 0.5em;\n    }\n\n    li a:hover {\n      color: $primaryColor;\n    }\n\n    & .icon {\n      font-size: 1.5em;\n    }\n  }\n\n  @media only screen and (max-width: $mediaBp1Width) {\n    & {\n      justify-content: center;\n      align-items: center;\n      flex-direction: column;\n      nav ul {\n        margin-top: 2em;\n      }\n    }\n  }\n}\n\n/* MEDIA QUERIES */\n@media only screen and (max-width: $mediaBp1Width) {\n  .column-5 {\n    grid-template-columns: 1fr 1fr 1fr;\n  }\n}\n\n@media only screen and (max-width: $mediaMinWidth) {\n  .column-5 {\n    grid-template-columns: 1fr;\n  }\n}\n\n/* ANIMATIONS */\n@keyframes moveRight {\n  0% {\n    left: -100%;\n  }\n  100% {\n    left: 0;\n  }\n}\n@keyframes moveLeft {\n  0% {\n    left: -100%;\n  }\n  100% {\n    left: -200%;\n  }\n}\n@keyframes moveBottom {\n  0% {\n    bottom: 0;\n    top: 0\n  }\n  100% {\n    bottom: -100%;\n    top: 100%;\n  }\n}\n@keyframes moveTop {\n  0% {\n    bottom: 0;\n    top: 0\n  }\n  100% {\n    bottom: 100%;\n    top: -100%;\n  }\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ "./src/styles/app.scss":
/*!*****************************!*\
  !*** ./src/styles/app.scss ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_app_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!../../node_modules/sass-loader/dist/cjs.js!./app.scss */ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/styles/app.scss");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_app_scss__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_app_scss__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_app_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_app_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ }),

/***/ "./src/assets/banner-bg.png":
/*!**********************************!*\
  !*** ./src/assets/banner-bg.png ***!
  \**********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "banner-bg.png";

/***/ }),

/***/ "./src/assets/information-image.png":
/*!******************************************!*\
  !*** ./src/assets/information-image.png ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "information-image.png";

/***/ }),

/***/ "./src/assets/logo.png":
/*!*****************************!*\
  !*** ./src/assets/logo.png ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "logo.png";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _modules_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules/app */ "./src/modules/app.js");

(0,_modules_app__WEBPACK_IMPORTED_MODULE_0__["default"])();
})();

/******/ })()
;
//# sourceMappingURL=main.bf564f8f68d112e5f914.js.map