	/** A deferred controls a Promise by exposing resolve, reject, and promise as properties */
	Promise.deferred = function() {
		var deferred = {};
		deferred.promise = new Promise(function(resolve, reject) {
			deferred.resolve = resolve;
			deferred.reject = reject;
		});
		return deferred;
	};
