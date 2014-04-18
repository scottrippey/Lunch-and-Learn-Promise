
	/* Core Promise; exposes resolve and reject using an immediate callback */
	function Promise(resolveRejectCallback) {
		if (!(this instanceof Promise)) return new Promise(resolveRejectCallback);

		var UNRESOLVED = 0, RESOLVED = 1, REJECTED = 2;
		var state = UNRESOLVED, finalResult;
		var successCallbacks = [], failureCallbacks = [];

		function resolve(result) {
			if (state === UNRESOLVED) {
				finalResult = result;
				state = RESOLVED;
				successCallbacks.forEach(function(success) {
					setImmediate(function() { success(finalResult); });
				});
				successCallbacks = failureCallbacks = null;
			}
		}
		function reject(error) {
			if (state === UNRESOLVED) {
				finalResult = error;
				state = REJECTED;
				failureCallbacks.forEach(function(failure) {
					setImmediate(function() { failure(finalResult); });
				});
				successCallbacks = failureCallbacks = null;
			}
		}
		function done(success, failure) {
			if (state === UNRESOLVED) {
				if (success)
					successCallbacks.push(success);
				if (failure)
					failureCallbacks.push(failure);
			} else if (state === RESOLVED) {
				if (success)
					setImmediate(function() { success(finalResult); });
			} else {
				if (failure)
					setImmediate(function() { failure(finalResult); });
			}
		}

		var promise = this;
		promise.done = done;

		resolveRejectCallback(resolve, reject);
	}

	/* Deferred is a different API that exposes resolve, reject, and promise */
	function Deferred() {
		if (!(this instanceof Deferred)) return new Deferred();

		var deferred = this;
		deferred.promise = new Promise(function(resolve, reject) {
			deferred.resolve = resolve;
			deferred.reject = reject;
		});
		return deferred;
	}


	/* Promise prototype methods; everything relies on Promise.done */

	Promise.prototype.then = function(success, failure) {
		var wrapper = Deferred();

		this.done(!success ? wrapper.resolve : function(result) {
			var thenSuccessResult = success(result);
			if (!Promise.isPromise(thenSuccessResult)) {
				wrapper.resolve(thenSuccessResult);
			} else {
				thenSuccessResult.done(wrapper.resolve, wrapper.reject);
			}
		}, !failure ? wrapper.reject : function(error) {
			var thenFailureResult = failure(error);
			if (!Promise.isPromise(thenFailureResult)) {
				wrapper.reject(thenFailureResult);
			} else {
				thenFailureResult.done(wrapper.resolve, wrapper.reject);
			}
		});

		return wrapper.promise;
	};

	Promise.prototype.catch = function(failure) {
		return this.then(null, failure);
	};

	Promise.prototype.finally = function(successOrFailure) {
		return this.done(successOrFailure, successOrFailure);
	};


	/* Promise static methods; utilities for promises */

	Promise.isPromise = function(promise) {
		return (promise instanceof Promise) || (typeof promise === 'object' && typeof promise.then === 'function');
	};
	Promise.from = function(promise) {
		return Promise.isPromise(promise) ? promise : Promise.wrap(promise);
	};
	Promise.wrap = function(result) {
		return new Promise(function(resolve, reject) { resolve(result); });
	};
	Promise.wrapError = function(error) {
		return new Promise(function(resolve, reject) { reject(error); });
	};
	Promise.all = function(promises) {
		return new Promise(function(resolve, reject) {
			var remaining = promises.length, results = new Array(remaining);
			if (promises.length === 0)
				resolve(results);
			promises.forEach(function(promise, i) {
				promise.done(function(result) {
					results[i] = result;
					remaining--;
					if (remaining === 0)
						resolve(results);
				}, reject);
			});
		});
	};
	Promise.any = function(promises) {
		return new Promise(function(resolve, reject) {
			var remaining = promises.length, errors = new Array(remaining);
			if (promises.length === 0)
				reject(errors);
			promises.forEach(function(promise, i) {
				promise.done(resolve, function(error) {
					errors[i] = error;
					remaining--;
					if (remaining === 0)
						reject(errors);
				});
			});
		});
	};
	Promise.delay = function(delay) {
		return new Promise(function(resolve, reject) {
			setTimeout(resolve, delay);
		});
	};


	/* Examples of Promises */

	function xhr(options) {
		var promise = new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open(options.method || 'GET', options.url, true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						resolve(xhr.responseText);
					} else {
						reject(xhr);
					}
				}
			};
			xhr.send();
		});
		if (options.autoRetry) {
			promise = promise.then(null, function(xhr) {
				options.autoRetry--;
				return xhr(options);
			});
		}
		return promise;
	}
	xhr.json = function(options) {
		return xhr(options).then(function(responseText) { return JSON.parse(responseText); });
	};
