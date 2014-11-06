
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
					chain(success, result);
				}
			}, function(error) {
				if (!failure) {
					reject(error);
				} else {
					chain(failure, error);
				}
			});

			function chain(callback, result) {
				try {
					var newResult = callback(result);
					if (Promise.isPromise(newResult)) {
						// Chain to the nested promise:
						newResult.done(resolve, reject);
					} else {
						// Chain the return value:
						resolve(newResult);
					}
				} catch (error) {
					reject(error);
				}
			}
		});
	};

	Promise.prototype.catch = function(failure) {
		return this.then(null, failure);
	};

	Promise.prototype.finally = function(successOrFailure) {
		this.done(successOrFailure, successOrFailure);
		return this;
	};

	Promise.isPromise = function(promise) {
		return (promise instanceof Promise);
	};
