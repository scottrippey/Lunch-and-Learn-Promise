	/**
	 * A Promise represents an async task.
	 *
	 * When the task is finished, the promise is either "resolved" with a result, or "rejected" with an error.
	 *
	 *
	 * A Promise allows you to add "success" and "failure" handlers.
	 * When the promise is resolved, it executes all success handlers; when rejected, it executes all failure handlers.
	 * If you add a handler *after* the promise was resolved or rejected, it will be executed nearly immediately.
	 *
	 * @param {function(resolve, reject)} exposeResolveReject
	 * @returns {Promise}
	 * @constructor
	 */
	function Promise(exposeResolveReject) {
		if (!(this instanceof Promise)) return new Promise(exposeResolveReject);

		var UNRESOLVED = 0, RESOLVED = 1, REJECTED = 2;
		var state = UNRESOLVED, finalResult;
		var successQueue = [], failureQueue = [];

		/**
		 * Resolves the promise, fires all success handlers
		 * @param {*} [result]
		 */
		function resolve(result) {
			if (state === UNRESOLVED) {
				state = RESOLVED;
				finalResult = result;
				successQueue.forEach(_fireCallback);
				successQueue = failureQueue = null;
			}
		}

		/**
		 * Rejects the promise, fires all failure handlers
		 * @param {*} [error]
		 */
		function reject(error) {
			if (state === UNRESOLVED) {
				state = REJECTED;
				finalResult = error;
				failureQueue.forEach(_fireCallback);
				successQueue = failureQueue = null;
			}
		}

		/**
		 * Adds a success and failure callback, one of which will be called once the promise is resolved or rejected.
		 * @param {function(result)} [success]
		 * @param {function(error)} [failure]
		 */
		function then(success, failure) {
			if (state === UNRESOLVED) {
				if (success)
					successQueue.push(success);
				if (failure)
					failureQueue.push(failure);
			} else if (state === RESOLVED) {
				if (success)
					_fireCallback(success);
			} else {
				if (failure)
					_fireCallback(failure);
			}
		}

		function _fireCallback(callback) {
			setImmediate(function() { callback(finalResult); });
		}

		this.then = then;

		exposeResolveReject(resolve, reject);
	}

	/**
	 * Adds a success and failure handler, and returns a new chained promise.
	 *
	 * The return value of the success or failure handler will be used to continue the chain.
	 * If the handler returns a promise, then that promise will be used to continue the chain.
	 * If either handler is omitted, the chain will simply pass-through.
	 *
	 * @param {function(result)} [success]
	 * @param {function(error)} [failure]
	 * @returns {Promise}
	 */
	Promise.prototype.pipe = function(success, failure) {
		var currentPromise = this;
		return new Promise(function(resolve, reject) {
			currentPromise.then(function(result) {
				if (!success) {
					// Pass-through:
					resolve(result);
				} else {
					var successResult = success(result);
					if (successResult instanceof Promise) {
						// Chain to the returned promise:
						successResult.then(resolve, reject);
					} else {
						// Pass-through the new value:
						resolve(successResult);
					}
				}
			}, function(error) {
				if (!failure) {
					// Pass-through:
					reject(error);
				} else {
					var failureResult = failure(error);
					if (failureResult instanceof Promise) {
						// Chain to the returned promise:
						failureResult.then(resolve, reject);
					} else {
						// Pass-through the new value:
						reject(failureResult);
					}
				}
			});
		});
	};

	/**
	 * Adds the callback to both success and failure, so it will run regardless of the resolution.
	 * This is useful for cleanup-related tasks.
	 *
	 * @param {function(resultOrError)} successOrFailure
	 */
	Promise.prototype.finally = function(successOrFailure) {
		this.then(successOrFailure, successOrFailure);
	};

