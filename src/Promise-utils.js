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
			if (promises.length === 0) {
				resolve(results);
			} else {
				promises.forEach(function (promise, i) {
					promise.done(function (result) {
						results[i] = result;
						remaining--;
						if (remaining === 0)
							resolve(results);
					}, reject);
				});
			}
		});
	};

	Promise.any = function(promises) {
		return new Promise(function(resolve, reject) {
			var remaining = promises.length, errors = new Array(remaining);
			if (promises.length === 0) {
				reject(errors);
			} else {
				promises.forEach(function (promise, i) {
					promise.done(resolve, function (error) {
						errors[i] = error;
						remaining--;
						if (remaining === 0)
							reject(errors);
					});
				});
			}
		});
	};

	Promise.delay = function(delay) {
		return new Promise(function(resolve, reject) {
			setTimeout(resolve, delay);
		});
	};

