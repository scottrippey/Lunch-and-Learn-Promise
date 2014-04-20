
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
		function then(success, failure) {
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
		promise.then = then;

		resolveRejectCallback(resolve, reject);
	}

	/* Promise prototype methods; everything relies on Promise.then */

	Promise.prototype.pipe = function(success, failure) {
		var currentPromise = this;
		return new Promise(function(resolve, reject) {
			currentPromise.then(function(result) {
				if (!success) {
					resolve(result);
				} else {
					var successResult = success(result);
					if (!Promise.isPromise(successResult)) {
						resolve(successResult);
					} else {
						successResult.then(resolve, reject);
					}
				}
			}, function(error) {
				if (!failure) {
					reject(error);
				} else {
					var failureResult = failure(error);
					if (!Promise.isPromise(failureResult)) {
						reject(failureResult);
					} else {
						failureResult.then(resolve, reject);
					}
				}
			});
		});
	};

	Promise.prototype.catch = function(failure) {
		return this.then(null, failure);
	};

	Promise.prototype.finally = function(successOrFailure) {
		return this.then(successOrFailure, successOrFailure);
	};
