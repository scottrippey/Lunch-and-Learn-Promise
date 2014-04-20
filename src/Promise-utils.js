	/**
	 * If the value is already a Promise, it'll be returned; otherwise, returns a Promise resolved with the value.
	 *
	 * @param {Promise|*} value
	 * @returns {Promise}
	 */
	Promise.from = function(value) {
		return (value instanceof Promise) ? value : Promise.resolved(value);
	};

	/**
	 * Returns a resolved Promise.
	 * @param {*} [result]
	 * @returns {Promise}
	 */
	Promise.resolved = function(result) {
		return new Promise(function(resolve, reject) { resolve(result); });
	};

	/**
	 * Returns a rejected Promise.
	 * @param {*} [error]
	 * @returns {Promise}
	 */
	Promise.rejected = function(error) {
		return new Promise(function(resolve, reject) { reject(error); });
	};

	/**
	 * Returns a Promise that gets resolved after the delay.
	 * @param {Number} delay - in milliseconds
	 * @returns {Promise}
	 */
	Promise.timeout = function(delay) {
		return new Promise(function(resolve, reject) {
			setTimeout(resolve, delay);
		});
	};

	/**
	 * Returns a Promise that is resolved once all promises are successful.
	 *
	 * The Promise is rejected if any promise fails.
	 *
	 * @param {Array|Object} promises - Either an array of promises, or a hash of promises.
	 *                                  The result will be either an array of results, or a hash of results.
	 * @returns {Promise}
	 */
	Promise.all = function(promises) {
		return new Promise(function(resolve, reject) {
			var isArray = promises.forEach, each, results;
			if (isArray) {
				each = function(array, callback) { array.forEach(callback); };
				results = new Array(promises.length);
			} else {
				each = function(object, callback) { for (var p in object) { if (object.hasOwnProperty(p)) callback(object[p], p); } };
				results = {};
			}
			var remaining = 0;

			each(promises, function (promise, i) {
				remaining++;
				promise.then(function (result) {
					results[i] = result;
					remaining--;
					if (remaining === 0) {
						resolve(results);
					}
				}, reject);
			});
			if (remaining === 0) {
				resolve(results);
			}
		});
	};
