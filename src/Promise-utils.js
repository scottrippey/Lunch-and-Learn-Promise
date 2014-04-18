	/* Promise static methods; utilities for promises */

	Promise.isPromise = function(promise) {

	};

	Promise.from = function(promise) {

	};

	Promise.resolved = function(result) {

	};

	Promise.rejected = function(error) {

	};

	Promise.delay = function(delay) {

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
