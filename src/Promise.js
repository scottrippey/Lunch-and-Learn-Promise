
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

	/* Promise prototype methods; everything relies on Promise.done */

	Promise.prototype.then = function(success, failure) {
		var currentPromise = this;
		return new Promise(function(resolve, reject) {
			currentPromise.done(function(result) {
				if (!success) {
					resolve(result);
				} else {
					var thenSuccessResult = success(result);

					if (!Promise.isPromise(thenSuccessResult)) {
						// Chain to the return value:
						resolve(thenSuccessResult);
					} else {
						// Chain to the nested promise:
						thenSuccessResult.done(resolve, reject);
					}
				}
			}, function(error) {
				if (!failure) {
					reject(error);
				} else {
					var thenFailureResult = failure(error);

					if (!Promise.isPromise(thenFailureResult)) {
						// Chain to the return value:
						resolve(thenFailureResult);
					} else {
						// Chain to the nested promise:
						thenFailureResult.done(resolve, reject);
					}
				}
			});
		});
	};

	Promise.prototype.catch = function(failure) {
		return this.then(null, failure);
	};

	Promise.prototype.finally = function(successOrFailure) {
		this.done(successOrFailure, successOrFailure);
		return this;
	};
